/**
 * Stratégies de cache pour les pilets
 * UC 1.2 - Optimisation des performances
 */

import type { ClaugerPiletMetadata } from '../instance/piral-types'
import { piletCache } from './pilet-cache'

/**
 * Type pour une stratégie de cache
 */
export type CacheStrategy = (
  pilet: ClaugerPiletMetadata,
  fetcher: () => Promise<string>
) => Promise<string>

/**
 * Stratégie Cache-First
 * Cherche d'abord dans le cache, puis sur le réseau si non trouvé
 */
export const cacheFirst: CacheStrategy = async (pilet, fetcher) => {
  const id = `${pilet.name}@${pilet.version}`
  
  // Chercher dans le cache
  const cached = await piletCache.get(id)
  if (cached) {
    console.log(`[CacheFirst] Hit for ${id}`)
    return cached.content
  }
  
  console.log(`[CacheFirst] Miss for ${id}, fetching from network`)
  
  // Sinon récupérer depuis le réseau
  try {
    const content = await fetcher()
    
    // Mettre en cache pour la prochaine fois
    await piletCache.set(pilet, content)
    
    return content
  } catch (error) {
    console.error(`[CacheFirst] Failed to fetch ${id}:`, error)
    throw error
  }
}

/**
 * Stratégie Network-First
 * Cherche d'abord sur le réseau, utilise le cache en fallback
 */
export const networkFirst: CacheStrategy = async (pilet, fetcher) => {
  const id = `${pilet.name}@${pilet.version}`
  
  try {
    // Essayer le réseau d'abord
    console.log(`[NetworkFirst] Fetching ${id} from network`)
    const content = await fetcher()
    
    // Mettre à jour le cache
    await piletCache.set(pilet, content)
    
    return content
  } catch (error) {
    console.warn(`[NetworkFirst] Network failed for ${id}, trying cache`)
    
    // Fallback sur le cache
    const cached = await piletCache.get(id)
    if (cached) {
      console.log(`[NetworkFirst] Using cached version for ${id}`)
      return cached.content
    }
    
    // Aucune version disponible
    console.error(`[NetworkFirst] No cached version for ${id}`)
    throw error
  }
}

/**
 * Stratégie Cache-Only
 * Utilise uniquement le cache, échoue si non trouvé
 */
export const cacheOnly: CacheStrategy = async (pilet, _fetcher) => {
  const id = `${pilet.name}@${pilet.version}`
  
  const cached = await piletCache.get(id)
  if (cached) {
    console.log(`[CacheOnly] Hit for ${id}`)
    return cached.content
  }
  
  throw new Error(`[CacheOnly] No cached version for ${id}`)
}

/**
 * Stratégie Network-Only
 * Utilise uniquement le réseau, ignore le cache
 */
export const networkOnly: CacheStrategy = async (pilet, fetcher) => {
  const id = `${pilet.name}@${pilet.version}`
  
  console.log(`[NetworkOnly] Fetching ${id} from network`)
  const content = await fetcher()
  
  // Optionnel : mettre en cache pour d'autres stratégies
  await piletCache.set(pilet, content)
  
  return content
}

/**
 * Stratégie Stale-While-Revalidate
 * Retourne le cache immédiatement et met à jour en arrière-plan
 */
export const staleWhileRevalidate: CacheStrategy = async (pilet, fetcher) => {
  const id = `${pilet.name}@${pilet.version}`
  
  // Récupérer depuis le cache
  const cached = await piletCache.get(id)
  
  // Lancer la mise à jour en arrière-plan
  const revalidate = async () => {
    try {
      const content = await fetcher()
      await piletCache.set(pilet, content)
      console.log(`[SWR] Updated cache for ${id}`)
    } catch (error) {
      console.warn(`[SWR] Failed to revalidate ${id}:`, error)
    }
  }
  
  if (cached) {
    console.log(`[SWR] Serving stale content for ${id}`)
    // Mettre à jour en arrière-plan sans attendre
    revalidate()
    return cached.content
  }
  
  // Si pas de cache, récupérer de manière synchrone
  console.log(`[SWR] No cache for ${id}, fetching sync`)
  const content = await fetcher()
  await piletCache.set(pilet, content)
  return content
}

/**
 * Stratégie avec timeout
 * Essaie le réseau avec un timeout, puis fallback sur le cache
 */
export const networkFirstWithTimeout = (timeout: number = 3000): CacheStrategy => {
  return async (pilet, fetcher) => {
    const id = `${pilet.name}@${pilet.version}`
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    })
    
    try {
      // Course entre le réseau et le timeout
      console.log(`[NetworkTimeout] Fetching ${id} with ${timeout}ms timeout`)
      const content = await Promise.race([fetcher(), timeoutPromise])
      
      // Mettre à jour le cache
      await piletCache.set(pilet, content as string)
      
      return content as string
    } catch (error) {
      console.warn(`[NetworkTimeout] Network failed/timeout for ${id}, trying cache`)
      
      // Fallback sur le cache
      const cached = await piletCache.get(id)
      if (cached) {
        console.log(`[NetworkTimeout] Using cached version for ${id}`)
        return cached.content
      }
      
      throw error
    }
  }
}

/**
 * Sélecteur de stratégie basé sur la configuration
 */
export function selectStrategy(
  strategyName: string,
  options?: { timeout?: number }
): CacheStrategy {
  switch (strategyName) {
    case 'cache-first':
      return cacheFirst
    case 'network-first':
      return networkFirst
    case 'cache-only':
      return cacheOnly
    case 'network-only':
      return networkOnly
    case 'stale-while-revalidate':
    case 'swr':
      return staleWhileRevalidate
    case 'network-first-timeout':
      return networkFirstWithTimeout(options?.timeout)
    default:
      console.warn(`[CacheStrategy] Unknown strategy: ${strategyName}, using cache-first`)
      return cacheFirst
  }
}

/**
 * Gestionnaire de cache avec métriques
 */
export class CacheStrategyManager {
  private strategy: CacheStrategy
  private metrics = {
    hits: 0,
    misses: 0,
    errors: 0,
    avgLoadTime: 0,
    loadTimes: [] as number[],
  }

  constructor(strategy: CacheStrategy | string) {
    this.strategy = typeof strategy === 'string' 
      ? selectStrategy(strategy)
      : strategy
  }

  /**
   * Charge un pilet avec la stratégie configurée
   */
  async load(
    pilet: ClaugerPiletMetadata,
    fetcher: () => Promise<string>
  ): Promise<string> {
    const start = performance.now()
    
    try {
      const content = await this.strategy(pilet, fetcher)
      
      // Mettre à jour les métriques
      const loadTime = performance.now() - start
      this.metrics.loadTimes.push(loadTime)
      if (this.metrics.loadTimes.length > 100) {
        this.metrics.loadTimes.shift() // Garder seulement les 100 derniers
      }
      this.metrics.avgLoadTime = this.metrics.loadTimes.reduce((a, b) => a + b, 0) / this.metrics.loadTimes.length
      
      // Déterminer si c'était un hit ou miss (approximatif)
      if (loadTime < 50) {
        this.metrics.hits++
      } else {
        this.metrics.misses++
      }
      
      // Déterminer si c'était un hit ou miss (réel)
      if (result.cacheHit) {
        this.metrics.hits++
      } else {
        this.metrics.misses++
      }
      
      return result.content
    } catch (error) {
      this.metrics.errors++
      throw error
    }
  }

  /**
   * Récupère les métriques de performance
   */
  getMetrics() {
    return {
      ...this.metrics,
      hitRate: this.metrics.hits / (this.metrics.hits + this.metrics.misses) * 100 || 0,
      errorRate: this.metrics.errors / (this.metrics.hits + this.metrics.misses + this.metrics.errors) * 100 || 0,
    }
  }

  /**
   * Réinitialise les métriques
   */
  resetMetrics() {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      avgLoadTime: 0,
      loadTimes: [],
    }
  }

  /**
   * Change la stratégie
   */
  setStrategy(strategy: CacheStrategy | string) {
    this.strategy = typeof strategy === 'string' 
      ? selectStrategy(strategy)
      : strategy
  }
}

// Export des instances pré-configurées
export const cacheManagers = {
  production: new CacheStrategyManager('cache-first'),
  development: new CacheStrategyManager('network-first'),
  offline: new CacheStrategyManager('cache-only'),
}