/**
 * Gestionnaire de cache principal
 * UC 1.2 - Orchestration du cache pour les pilets
 */

import type { ClaugerPiletMetadata } from '../instance/piral-types'
import { piletCache } from './pilet-cache'
import { CacheStrategyManager, selectStrategy } from './cache-strategies'
import { getPiralConfig, featureFlags, CRITICAL_PILETS } from '../instance/piral-config'

/**
 * Configuration du gestionnaire de cache
 */
interface CacheManagerConfig {
  strategy: string
  enablePreloading: boolean
  enableMetrics: boolean
  criticalPilets: string[]
  maxRetries: number
  retryDelay: number
}

/**
 * Gestionnaire de cache centralisé pour l'orchestrateur
 */
export class CacheManager {
  private strategyManager: CacheStrategyManager
  private config: CacheManagerConfig
  private preloadPromise: Promise<void> | null = null

  constructor(config?: Partial<CacheManagerConfig>) {
    const piralConfig = getPiralConfig()
    
    this.config = {
      strategy: piralConfig.cacheOptions.strategy,
      enablePreloading: featureFlags.enablePreloading,
      enableMetrics: featureFlags.enablePerformanceMonitoring,
      criticalPilets: CRITICAL_PILETS,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    }

    this.strategyManager = new CacheStrategyManager(this.config.strategy)
  }

  /**
   * Charge un pilet avec gestion du cache
   */
  async loadPilet(pilet: ClaugerPiletMetadata): Promise<string> {
    const fetcher = () => this.fetchWithRetry(pilet)
    return this.strategyManager.load(pilet, fetcher)
  }

  /**
   * Récupère un pilet depuis le réseau avec retry
   */
  private async fetchWithRetry(
    pilet: ClaugerPiletMetadata,
    attempt: number = 0
  ): Promise<string> {
    try {
      if (!pilet.link) {
        throw new Error(`No link provided for pilet ${pilet.name}`)
      }

      const response = await fetch(pilet.link, {
        headers: {
          'Accept': 'application/javascript',
        },
        cache: 'no-cache', // Gérer le cache nous-mêmes
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.text()
    } catch (error) {
      console.error(`[CacheManager] Failed to fetch ${pilet.name} (attempt ${attempt + 1}):`, error)
      
      if (attempt < this.config.maxRetries - 1) {
        // Attendre avant de réessayer (exponential backoff)
        const delay = this.config.retryDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        return this.fetchWithRetry(pilet, attempt + 1)
      }
      
      throw error
    }
  }

  /**
   * Précharge les pilets critiques
   */
  async preloadCritical(pilets: ClaugerPiletMetadata[]): Promise<void> {
    if (!this.config.enablePreloading) {
      console.log('[CacheManager] Preloading disabled')
      return
    }

    // Éviter les préchargements multiples
    if (this.preloadPromise) {
      return this.preloadPromise
    }

    this.preloadPromise = this.doPreload(pilets)
    await this.preloadPromise
    this.preloadPromise = null
  }

  private async doPreload(pilets: ClaugerPiletMetadata[]): Promise<void> {
    const criticalPilets = pilets.filter(p => 
      this.config.criticalPilets.includes(p.name)
    )

    if (criticalPilets.length === 0) {
      console.log('[CacheManager] No critical pilets to preload')
      return
    }

    console.log(`[CacheManager] Preloading ${criticalPilets.length} critical pilets`)
    
    // Précharger en parallèle avec limite de concurrence
    const concurrency = 3
    const chunks = []
    
    for (let i = 0; i < criticalPilets.length; i += concurrency) {
      chunks.push(criticalPilets.slice(i, i + concurrency))
    }

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(pilet => this.loadPilet(pilet))
      )
    }

    console.log('[CacheManager] Critical pilets preloaded')
  }

  /**
   * Invalide le cache pour un pilet spécifique
   */
  async invalidate(piletName: string, version?: string): Promise<void> {
    const id = version ? `${piletName}@${version}` : piletName
    await piletCache.remove(id)
    console.log(`[CacheManager] Invalidated cache for ${id}`)
  }

  /**
   * Invalide tout le cache
   */
  async invalidateAll(): Promise<void> {
    await piletCache.clear()
    this.strategyManager.resetMetrics()
    console.log('[CacheManager] All cache invalidated')
  }

  /**
   * Récupère les statistiques du cache
   */
  async getStats() {
    const cacheStats = await piletCache.getStats()
    const strategyMetrics = this.strategyManager.getMetrics()
    
    return {
      cache: cacheStats,
      strategy: strategyMetrics,
      config: this.config,
    }
  }

  /**
   * Vérifie l'état du cache
   */
  async healthCheck(): Promise<{
    healthy: boolean
    issues: string[]
  }> {
    const issues: string[] = []
    
    try {
      // Vérifier IndexedDB
      const stats = await piletCache.getStats()
      
      // Vérifier la taille
      const maxSizeBytes = 50 * 1024 * 1024 // 50MB
      if (stats.totalSize > maxSizeBytes * 0.9) {
        issues.push('Cache size approaching limit (>90%)')
      }
      
      // Vérifier le taux de hit
      const metrics = this.strategyManager.getMetrics()
      if (metrics.hitRate < 50 && metrics.hits + metrics.misses > 10) {
        issues.push(`Low cache hit rate: ${metrics.hitRate.toFixed(1)}%`)
      }
      
      // Vérifier le taux d'erreur
      if (metrics.errorRate > 10) {
        issues.push(`High error rate: ${metrics.errorRate.toFixed(1)}%`)
      }
      
      // Vérifier l'âge du cache
      if (stats.oldestEntry) {
        const age = Date.now() - stats.oldestEntry
        const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 jours
        if (age > maxAge) {
          issues.push('Cache contains very old entries (>7 days)')
        }
      }
      
    } catch (error) {
      console.error('[CacheManager] Health check failed:', error)
      issues.push('Failed to access cache storage')
    }
    
    return {
      healthy: issues.length === 0,
      issues,
    }
  }

  /**
   * Optimise le cache en supprimant les entrées inutilisées
   */
  async optimize(): Promise<void> {
    console.log('[CacheManager] Starting cache optimization')
    
    const stats = await this.getStats()
    
    // Supprimer les vieilles entrées
    const all = await piletCache.getAll()
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 heures
    
    for (const cached of all) {
      // Supprimer si non critique et vieux
      const isCritical = this.config.criticalPilets.includes(cached.name)
      const age = now - cached.timestamp
      
      if (!isCritical && age > maxAge) {
        await piletCache.remove(cached.id)
      }
    }
    
    console.log('[CacheManager] Cache optimization complete')
  }

  /**
   * Configure la stratégie de cache
   */
  setStrategy(strategy: string): void {
    this.config.strategy = strategy
    this.strategyManager.setStrategy(strategy)
    console.log(`[CacheManager] Strategy changed to: ${strategy}`)
  }

  /**
   * Active/désactive le préchargement
   */
  setPreloading(enabled: boolean): void {
    this.config.enablePreloading = enabled
    console.log(`[CacheManager] Preloading ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Exporte les métriques pour monitoring
   */
  async exportMetrics(): Promise<{
    timestamp: number
    cache: any
    performance: any
  }> {
    const stats = await this.getStats()
    
    return {
      timestamp: Date.now(),
      cache: stats.cache,
      performance: {
        ...stats.strategy,
        avgLoadTime: `${stats.strategy.avgLoadTime.toFixed(2)}ms`,
        hitRate: `${stats.strategy.hitRate.toFixed(1)}%`,
        errorRate: `${stats.strategy.errorRate.toFixed(1)}%`,
      },
    }
  }
}

// Export singleton
export const cacheManager = new CacheManager()

// Auto-optimisation périodique
if (typeof window !== 'undefined' && featureFlags.enableCache) {
  // Optimiser le cache toutes les heures
  setInterval(() => {
    cacheManager.optimize().catch(console.error)
  }, 60 * 60 * 1000)
  
  // Health check toutes les 5 minutes
  setInterval(async () => {
    const health = await cacheManager.healthCheck()
    if (!health.healthy) {
      console.warn('[CacheManager] Health issues detected:', health.issues)
    }
  }, 5 * 60 * 1000)
}