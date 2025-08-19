/**
 * Configuration de l'instance Piral
 * UC 1.2 - Configuration de l'orchestrateur micro-frontend
 */

import type { PiralInstanceConfig, PiletCacheOptions } from './piral-types'

/**
 * Default cache options
 */
export const DEFAULT_CACHE_OPTIONS: PiletCacheOptions = {
  ttl: 3600000, // 1 hour
  maxSize: 50,
  strategy: 'cache-first',
  maxAge: 3600000,
  preloadCritical: true,
}

/**
 * Critical pilets that should be preloaded
 */
export const CRITICAL_PILETS = [
  'sidebar',
  'dashboard',
  'navigation',
]

/**
 * Permission levels
 */
export const PERMISSION_LEVELS = {
  PUBLIC: 0,
  USER: 1,
  MANAGER: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
}

/**
 * Récupère la configuration selon l'environnement
 */
export function getPiralConfig(): PiralInstanceConfig {
  const environment = import.meta.env.MODE as 'development' | 'staging' | 'production'
  
  // Configuration du cache
  const cacheOptions: PiletCacheOptions = {
    ttl: parseInt(import.meta.env.VITE_PIRAL_CACHE_TTL || '') || DEFAULT_CACHE_OPTIONS.ttl,
    maxAge: environment === 'production' ? 3600000 : 60000, // 1h en prod, 1min en dev
    maxSize: parseInt(import.meta.env.VITE_PIRAL_CACHE_MAX_SIZE || '') || DEFAULT_CACHE_OPTIONS.maxSize,
    strategy: (import.meta.env.VITE_PIRAL_CACHE_STRATEGY as any) || 
             (environment === 'development' ? 'network-first' : 'cache-first'),
    preloadCritical: true,
  }

  // Configuration par environnement
  const configs: Record<string, PiralInstanceConfig> = {
    development: {
      feedUrl: import.meta.env.VITE_PIRAL_FEED_URL || import.meta.env.VITE_PILETS_FEED_URL || '/api/v1/pilets',
      debug: import.meta.env.VITE_PIRAL_DEBUG === 'true' || (environment === 'development' && !import.meta.env.VITE_PIRAL_DEBUG),
      strictMode: import.meta.env.VITE_PIRAL_STRICT_MODE !== 'false',
      async: true,
      cacheOptions,
      requestOptions: {
        headers: {
          'Accept': 'application/json',
          'X-Environment': 'development',
        },
        timeout: 5000,
        retry: 1,
      },
    },
    staging: {
      feedUrl: import.meta.env.VITE_PIRAL_FEED_URL || import.meta.env.VITE_PILETS_FEED_URL || 'https://staging.clauger.com/api/pilets',
      debug: import.meta.env.VITE_PIRAL_DEBUG === 'true',
      strictMode: import.meta.env.VITE_PIRAL_STRICT_MODE !== 'false',
      async: true,
      cacheOptions,
      requestOptions: {
        headers: {
          'Accept': 'application/json',
          'X-Environment': 'staging',
        },
        timeout: 10000,
        retry: 2,
      },
    },
    production: {
      feedUrl: import.meta.env.VITE_PIRAL_FEED_URL || import.meta.env.VITE_PILETS_FEED_URL || '',
      debug: import.meta.env.VITE_PIRAL_DEBUG === 'true',
      strictMode: true,
      async: true,
      cacheOptions,
      requestOptions: {
        headers: {
          'Accept': 'application/json',
          'X-Environment': 'production',
        },
        timeout: 15000,
        retry: 3,
      },
    },
  }

  const config = configs[environment] || configs.development

  // Ajouter le token d'authentification si disponible
  const authToken = getAuthToken()
  if (authToken && config) {
    config.requestOptions.headers = {
      ...config.requestOptions.headers,
      'Authorization': `Bearer ${authToken}`,
    }
  }

  return config!
}

/**
 * Récupère le token d'authentification depuis le storage
 */
function getAuthToken(): string | null {
  // TODO: À implémenter avec MSAL dans UC 2.x
  // Pour l'instant, on utilise un token mockup en dev
  if (import.meta.env.MODE === 'development') {
    return localStorage.getItem('mock_auth_token') || null
  }
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
}

/**
 * Valide la configuration
 */
export function validateConfig(config: PiralInstanceConfig): boolean {
  if (!config.feedUrl) {
    console.error('Feed URL is required')
    return false
  }

  if (!config.cacheOptions) {
    console.error('Cache options are required')
    return false
  }

  if (config.cacheOptions.ttl && config.cacheOptions.ttl <= 0) {
    console.error('Cache TTL must be positive')
    return false
  }

  if (config.cacheOptions.maxSize <= 0) {
    console.error('Cache size must be positive')
    return false
  }

  const validStrategies = ['cache-first', 'network-first', 'cache-only', 'network-only']
  if (config.cacheOptions.strategy && !validStrategies.includes(config.cacheOptions.strategy)) {
    console.error('Invalid cache strategy')
    return false
  }

  if (config.cacheOptions.maxSize < 10) {
    console.warn('Cache size is very small, consider increasing it')
  }

  if (config.requestOptions?.timeout && config.requestOptions.timeout < 1000) {
    console.warn('Request timeout is very low, consider increasing it')
  }

  return true
}

/**
 * Configuration des feature flags
 */
export const featureFlags = {
  enableCache: true,
  enableErrorBoundaries: true,
  enableLazyLoading: true,
  enablePreloading: true,
  enableServiceWorker: false,
  enableDebugTools: import.meta.env.MODE === 'development',
  enablePerformanceMonitoring: import.meta.env.MODE === 'development',
  enableAnalytics: false,
  enablePiralDebugger: import.meta.env.MODE === 'development',
  enableErrorReporting: import.meta.env.MODE !== 'development',
  enableCaching: true,
  enableOfflineMode: false, // À activer dans UC 1.3
}

/**
 * URLs des CDN pour les pilets partagés
 */
export const cdnUrls = {
  development: 'http://localhost:3002',
  staging: 'https://cdn-staging.clauger.com',
  production: 'https://cdn.clauger.com',
}

/**
 * Configuration des limites
 */
export const limits = {
  maxPilets: 50,
  maxPiletSize: 5 * 1024 * 1024, // 5MB
  maxConcurrentLoads: 3,
  piletTimeout: 30000, // 30s
}

