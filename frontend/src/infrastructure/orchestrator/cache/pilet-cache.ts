/**
 * Cache Manager pour les pilets avec IndexedDB
 * UC 1.2 - Gestion du cache persistant
 */

import type { ClaugerPiletMetadata, CachedPilet } from '../instance/piral-types'

/**
 * Configuration du cache
 */
interface CacheConfig {
  dbName: string
  storeName: string
  version: number
  maxAge: number // TTL en millisecondes
  maxSize: number // Taille max en MB
}

/**
 * Gestionnaire de cache pour les pilets
 */
export class PiletCacheManager {
  private db: IDBDatabase | null = null
  private config: CacheConfig
  private memoryCache: Map<string, CachedPilet> = new Map()

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      dbName: 'ClaugerMainHub',
      storeName: 'pilets',
      version: 1,
      maxAge: 3600000, // 1 heure par défaut
      maxSize: 50, // 50MB par défaut
      ...config,
    }
    
    this.initDB()
  }

  /**
   * Initialise la base de données IndexedDB
   */
  private async initDB(): Promise<void> {
    if (!('indexedDB' in window)) {
      console.warn('[PiletCache] IndexedDB not supported')
      return
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version)

      request.onerror = () => {
        console.error('[PiletCache] Failed to open IndexedDB:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('[PiletCache] IndexedDB initialized')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Créer le store si nécessaire
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, { 
            keyPath: 'id' 
          })
          
          // Index pour recherche rapide
          store.createIndex('name', 'name', { unique: false })
          store.createIndex('version', 'version', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  /**
   * Récupère un pilet du cache
   */
  async get(id: string): Promise<CachedPilet | null> {
    // Vérifier d'abord le cache mémoire
    const memCached = this.memoryCache.get(id)
    if (memCached && this.isValid(memCached)) {
      return memCached
    }

    // Sinon chercher dans IndexedDB
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readonly')
      const store = transaction.objectStore(this.config.storeName)
      const request = store.get(id)

      request.onsuccess = () => {
        const cached = request.result as CachedPilet | undefined
        
        if (cached && this.isValid(cached)) {
          // Mettre à jour le cache mémoire
          this.memoryCache.set(id, cached)
          resolve(cached)
        } else {
          // Invalide ou expiré
          if (cached) {
            this.remove(id)
          }
          resolve(null)
        }
      }

      request.onerror = () => {
        console.error('[PiletCache] Failed to get pilet:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Stocke un pilet dans le cache
   */
  async set(pilet: ClaugerPiletMetadata, content: string): Promise<void> {
    const cached: CachedPilet = {
      id: `${pilet.name}@${pilet.version}`,
      name: pilet.name,
      version: pilet.version,
      content,
      metadata: pilet,
      timestamp: Date.now(),
      size: new Blob([content]).size,
    }

    // Vérifier la taille
    if (await this.wouldExceedSizeLimit(cached.size)) {
      await this.evictOldest()
    }

    // Mettre à jour le cache mémoire
    this.memoryCache.set(cached.id, cached)

    // Persister dans IndexedDB
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite')
      const store = transaction.objectStore(this.config.storeName)
      const request = store.put(cached)

      request.onsuccess = () => {
        console.log(`[PiletCache] Cached pilet: ${cached.id}`)
        resolve()
      }

      request.onerror = () => {
        console.error('[PiletCache] Failed to cache pilet:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Supprime un pilet du cache
   */
  async remove(id: string): Promise<void> {
    // Supprimer du cache mémoire
    this.memoryCache.delete(id)

    // Supprimer d'IndexedDB
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite')
      const store = transaction.objectStore(this.config.storeName)
      const request = store.delete(id)

      request.onsuccess = () => {
        console.log(`[PiletCache] Removed pilet: ${id}`)
        resolve()
      }

      request.onerror = () => {
        console.error('[PiletCache] Failed to remove pilet:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Vide tout le cache
   */
  async clear(): Promise<void> {
    // Vider le cache mémoire
    this.memoryCache.clear()

    // Vider IndexedDB
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite')
      const store = transaction.objectStore(this.config.storeName)
      const request = store.clear()

      request.onsuccess = () => {
        console.log('[PiletCache] Cache cleared')
        resolve()
      }

      request.onerror = () => {
        console.error('[PiletCache] Failed to clear cache:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Récupère tous les pilets en cache
   */
  async getAll(): Promise<CachedPilet[]> {
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readonly')
      const store = transaction.objectStore(this.config.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const cached = request.result as CachedPilet[]
        const valid = cached.filter(item => this.isValid(item))
        
        // Nettoyer les entrées expirées
        const expired = cached.filter(item => !this.isValid(item))
        expired.forEach(item => this.remove(item.id))
        
        resolve(valid)
      }

      request.onerror = () => {
        console.error('[PiletCache] Failed to get all pilets:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Précharge une liste de pilets
   */
  async preload(pilets: ClaugerPiletMetadata[]): Promise<void> {
    const promises = pilets.map(async (pilet) => {
      const id = `${pilet.name}@${pilet.version}`
      const cached = await this.get(id)
      
      if (!cached && pilet.link) {
        try {
          const response = await fetch(pilet.link)
          if (response.ok) {
            const content = await response.text()
            await this.set(pilet, content)
          }
        } catch (error) {
          console.error(`[PiletCache] Failed to preload ${id}:`, error)
        }
      }
    })

    await Promise.all(promises)
    console.log(`[PiletCache] Preloaded ${pilets.length} pilets`)
  }

  /**
   * Vérifie si une entrée est valide (non expirée)
   */
  private isValid(cached: CachedPilet): boolean {
    const age = Date.now() - cached.timestamp
    return age < this.config.maxAge
  }

  /**
   * Vérifie si ajouter une taille dépasserait la limite
   */
  private async wouldExceedSizeLimit(newSize: number): Promise<boolean> {
    const totalSize = await this.getTotalSize()
    const maxSizeBytes = this.config.maxSize * 1024 * 1024 // Convertir MB en bytes
    return (totalSize + newSize) > maxSizeBytes
  }

  /**
   * Calcule la taille totale du cache
   */
  private async getTotalSize(): Promise<number> {
    const all = await this.getAll()
    return all.reduce((total, item) => total + item.size, 0)
  }

  /**
   * Évince les entrées les plus anciennes
   */
  private async evictOldest(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readonly')
      const store = transaction.objectStore(this.config.storeName)
      const index = store.index('timestamp')
      const request = index.openCursor()
      
      const toDelete: string[] = []
      let freedSpace = 0
      const targetSpace = this.config.maxSize * 1024 * 1024 * 0.2 // Libérer 20% de l'espace

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        
        if (cursor && freedSpace < targetSpace) {
          const cached = cursor.value as CachedPilet
          toDelete.push(cached.id)
          freedSpace += cached.size
          cursor.continue()
        } else {
          // Supprimer les entrées sélectionnées
          Promise.all(toDelete.map(id => this.remove(id)))
            .then(() => {
              console.log(`[PiletCache] Evicted ${toDelete.length} entries`)
              resolve()
            })
            .catch(reject)
        }
      }

      request.onerror = () => {
        console.error('[PiletCache] Failed to evict entries:', request.error)
        reject(request.error)
      }
    })
  }

  /**
   * Récupère les statistiques du cache
   */
  async getStats(): Promise<{
    count: number
    totalSize: number
    oldestEntry: number | null
    hitRate: number
  }> {
    const all = await this.getAll()
    const totalSize = all.reduce((sum, item) => sum + item.size, 0)
    const oldestEntry = all.length > 0 
      ? Math.min(...all.map(item => item.timestamp))
      : null

    return {
      count: all.length,
      totalSize,
      oldestEntry,
      hitRate: this.calculateHitRate(),
    }
  }

  private hits = 0
  private misses = 0

  private calculateHitRate(): number {
    const total = this.hits + this.misses
    return total > 0 ? (this.hits / total) * 100 : 0
  }

  /**
   * Ferme la connexion à la base de données
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
    this.memoryCache.clear()
  }
}

// Export singleton
export const piletCache = new PiletCacheManager()