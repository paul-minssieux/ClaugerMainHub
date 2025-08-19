/**
 * Service Worker pour ClaugerMainHub
 * UC 1.2 - Support du mode offline et caching avancé
 */

// Versions et configurations
const CACHE_VERSION = 'v1.0.0'
const CACHE_NAMES = {
  static: `clauger-static-${CACHE_VERSION}`,
  runtime: `clauger-runtime-${CACHE_VERSION}`,
  pilets: `clauger-pilets-${CACHE_VERSION}`,
  api: `clauger-api-${CACHE_VERSION}`,
}

// Assets critiques à précacher
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
]

// Patterns d'URL pour différentes stratégies de cache
const CACHE_STRATEGIES = {
  // Network first pour API
  networkFirst: [
    /\/api\//,
    /\/auth\//,
  ],
  // Cache first pour assets statiques
  cacheFirst: [
    /\.(?:js|css|woff2?|ttf|otf|eot)$/,
    /\/assets\//,
    /\/static\//,
  ],
  // Stale while revalidate pour images
  staleWhileRevalidate: [
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
    /\/images\//,
  ],
  // Cache only pour assets offline
  cacheOnly: [
    /\/offline\//,
  ],
}

// Durées de cache (en secondes)
const CACHE_DURATIONS = {
  api: 5 * 60, // 5 minutes
  static: 7 * 24 * 60 * 60, // 7 jours
  pilets: 24 * 60 * 60, // 24 heures
  images: 30 * 24 * 60 * 60, // 30 jours
}

/**
 * Installation du Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing version:', CACHE_VERSION)
  
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then((cache) => {
        console.log('[ServiceWorker] Precaching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        // Force l'activation immédiate
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[ServiceWorker] Install failed:', error)
      })
  )
})

/**
 * Activation du Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating version:', CACHE_VERSION)
  
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      cleanupOldCaches(),
      // Prendre le contrôle immédiatement
      self.clients.claim(),
    ])
  )
})

/**
 * Interception des requêtes
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorer les requêtes non-HTTP(S)
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  // Ignorer les requêtes cross-origin sauf CDN autorisés
  if (url.origin !== self.location.origin && !isAllowedCDN(url)) {
    return
  }
  
  // Déterminer la stratégie de cache
  const strategy = determineStrategy(request)
  
  // Appliquer la stratégie
  event.respondWith(
    executeStrategy(strategy, request)
      .catch((error) => {
        console.error('[ServiceWorker] Fetch failed:', error)
        return handleOffline(request)
      })
  )
})

/**
 * Gestion des messages du client
 */
self.addEventListener('message', (event) => {
  const { type, data } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'CACHE_PILET':
      cachePilet(data.pilet, data.content)
        .then(() => {
          event.ports[0].postMessage({ success: true })
        })
        .catch((error) => {
          event.ports[0].postMessage({ success: false, error: error.message })
        })
      break
      
    case 'CLEAR_CACHE':
      clearCache(data.cacheName)
        .then(() => {
          event.ports[0].postMessage({ success: true })
        })
        .catch((error) => {
          event.ports[0].postMessage({ success: false, error: error.message })
        })
      break
      
    case 'GET_CACHE_SIZE':
      getCacheSize()
        .then((size) => {
          event.ports[0].postMessage({ size })
        })
        .catch((error) => {
          event.ports[0].postMessage({ error: error.message })
        })
      break
  }
})

/**
 * Synchronisation en arrière-plan
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pilets') {
    event.waitUntil(syncPilets())
  }
})

/**
 * Notification push
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  
  const options = {
    body: data.body || 'Nouvelle notification de ClaugerMainHub',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || Date.now(),
    },
    actions: data.actions || [],
  }
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'ClaugerMainHub',
      options
    )
  )
})

// ============= Fonctions utilitaires =============

/**
 * Détermine la stratégie de cache pour une requête
 */
function determineStrategy(request) {
  const url = request.url
  
  // Vérifier chaque pattern de stratégie
  for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        return strategy
      }
    }
  }
  
  // Stratégie par défaut selon la méthode
  if (request.method !== 'GET') {
    return 'networkOnly'
  }
  
  // Pilets spéciaux
  if (url.includes('/pilets/') || url.includes('@')) {
    return 'cacheFirst'
  }
  
  return 'networkFirst'
}

/**
 * Exécute la stratégie de cache
 */
async function executeStrategy(strategy, request) {
  switch (strategy) {
    case 'cacheFirst':
      return cacheFirst(request)
    case 'networkFirst':
      return networkFirst(request)
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request)
    case 'cacheOnly':
      return cacheOnly(request)
    case 'networkOnly':
    default:
      return fetch(request)
  }
}

/**
 * Stratégie Cache First
 */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  
  if (cached) {
    // Vérifier l'expiration
    const cacheTime = cached.headers.get('sw-cache-time')
    if (cacheTime && !isExpired(cacheTime, CACHE_DURATIONS.static)) {
      return cached
    }
  }
  
  // Sinon fetch et cache
  const response = await fetch(request)
  
  if (response.ok) {
    const cache = await getCacheForRequest(request)
    const responseToCache = response.clone()
    
    // Ajouter timestamp
    const headers = new Headers(responseToCache.headers)
    headers.set('sw-cache-time', Date.now().toString())
    
    const modifiedResponse = new Response(responseToCache.body, {
      status: responseToCache.status,
      statusText: responseToCache.statusText,
      headers,
    })
    
    cache.put(request, modifiedResponse)
  }
  
  return response
}

/**
 * Stratégie Network First
 */
async function networkFirst(request) {
  try {
    const response = await fetchWithTimeout(request, 5000)
    
    if (response.ok) {
      const cache = await getCacheForRequest(request)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    throw error
  }
}

/**
 * Stratégie Stale While Revalidate
 */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = getCacheForRequest(request)
      cache.then((c) => c.put(request, response.clone()))
    }
    return response
  })
  
  return cached || fetchPromise
}

/**
 * Stratégie Cache Only
 */
async function cacheOnly(request) {
  const cached = await caches.match(request)
  
  if (!cached) {
    throw new Error('No cached response available')
  }
  
  return cached
}

/**
 * Fetch avec timeout
 */
function fetchWithTimeout(request, timeout = 5000) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ])
}

/**
 * Détermine le cache approprié pour une requête
 */
async function getCacheForRequest(request) {
  const url = request.url
  
  if (url.includes('/api/')) {
    return caches.open(CACHE_NAMES.api)
  }
  
  if (url.includes('/pilets/') || url.includes('@')) {
    return caches.open(CACHE_NAMES.pilets)
  }
  
  if (url.match(/\.(js|css|woff2?|ttf|otf|eot)$/)) {
    return caches.open(CACHE_NAMES.static)
  }
  
  return caches.open(CACHE_NAMES.runtime)
}

/**
 * Vérifie si un cache est expiré
 */
function isExpired(timestamp, maxAge) {
  const age = Date.now() - parseInt(timestamp)
  return age > maxAge * 1000
}

/**
 * Vérifie si une URL est un CDN autorisé
 */
function isAllowedCDN(url) {
  const allowedCDNs = [
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
    'https://cdnjs.cloudflare.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ]
  
  return allowedCDNs.some((cdn) => url.href.startsWith(cdn))
}

/**
 * Gère les requêtes offline
 */
async function handleOffline(request) {
  // Essayer de trouver une réponse en cache
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }
  
  // Page offline spéciale pour navigation
  if (request.mode === 'navigate') {
    const offlinePage = await caches.match('/offline.html')
    if (offlinePage) {
      return offlinePage
    }
  }
  
  // Réponse par défaut
  return new Response('Offline - Content not available', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/plain',
    }),
  })
}

/**
 * Nettoie les anciens caches
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys()
  const currentCaches = Object.values(CACHE_NAMES)
  
  const cachesToDelete = cacheNames.filter((cacheName) => {
    return !currentCaches.includes(cacheName)
  })
  
  await Promise.all(
    cachesToDelete.map((cacheName) => {
      console.log('[ServiceWorker] Deleting old cache:', cacheName)
      return caches.delete(cacheName)
    })
  )
}

/**
 * Cache un pilet spécifique
 */
async function cachePilet(pilet, content) {
  const cache = await caches.open(CACHE_NAMES.pilets)
  const url = pilet.link || `/pilets/${pilet.name}@${pilet.version}`
  
  const response = new Response(content, {
    headers: {
      'Content-Type': 'application/javascript',
      'sw-cache-time': Date.now().toString(),
      'X-Pilet-Name': pilet.name,
      'X-Pilet-Version': pilet.version,
    },
  })
  
  await cache.put(url, response)
  console.log('[ServiceWorker] Cached pilet:', pilet.name)
}

/**
 * Vide un cache spécifique
 */
async function clearCache(cacheName) {
  if (cacheName && CACHE_NAMES[cacheName]) {
    await caches.delete(CACHE_NAMES[cacheName])
    console.log('[ServiceWorker] Cleared cache:', cacheName)
  } else if (!cacheName) {
    // Vider tous les caches
    await Promise.all(
      Object.values(CACHE_NAMES).map((name) => caches.delete(name))
    )
    console.log('[ServiceWorker] Cleared all caches')
  }
}

/**
 * Calcule la taille totale du cache
 */
async function getCacheSize() {
  if (!navigator.storage || !navigator.storage.estimate) {
    return { usage: 0, quota: 0 }
  }
  
  const estimate = await navigator.storage.estimate()
  return {
    usage: estimate.usage || 0,
    quota: estimate.quota || 0,
    percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0,
  }
}

/**
 * Synchronise les pilets avec le serveur
 */
async function syncPilets() {
  try {
    const response = await fetch('/api/v1/pilets')
    
    if (response.ok) {
      const data = await response.json()
      const pilets = data.items || []
      
      // Mettre à jour le cache des pilets
      const cache = await caches.open(CACHE_NAMES.pilets)
      
      for (const pilet of pilets) {
        if (pilet.link) {
          const piletResponse = await fetch(pilet.link)
          if (piletResponse.ok) {
            await cache.put(pilet.link, piletResponse)
          }
        }
      }
      
      console.log('[ServiceWorker] Synced', pilets.length, 'pilets')
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error)
  }
}

// Log de démarrage
console.log('[ServiceWorker] Script loaded, version:', CACHE_VERSION)