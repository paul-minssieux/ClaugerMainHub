/**
 * Service de gestion du feed des pilets
 * UC 1.2 - Récupération et gestion des pilets
 */

import type { ClaugerPiletMetadata } from '../instance/piral-types'
import { getPiralConfig } from '../instance/piral-config'

class FeedService {
  private config = getPiralConfig()
  private cache: Map<string, ClaugerPiletMetadata> = new Map()

  /**
   * Récupère les pilets disponibles depuis le feed
   */
  async getAvailablePilets(): Promise<ClaugerPiletMetadata[]> {
    try {
      // Pour le moment, retourner un tableau vide en attendant le backend
      // TODO: Implémenter l'appel au vrai feed service
      console.log('[FeedService] Fetching pilets from:', this.config.feedUrl)
      
      // En développement, on peut mocker quelques pilets
      if (import.meta.env.DEV) {
        return this.getMockPilets()
      }

      const response = await fetch(this.config.feedUrl, {
        headers: {
          'Accept': 'application/json',
          ...this.config.requestOptions?.headers,
        },
        signal: AbortSignal.timeout(this.config.requestOptions?.timeout || 10000),
      })

      if (!response.ok) {
        throw new Error(`Feed service returned ${response.status}`)
      }

      const data = await response.json()
      const pilets = data.items || []
      
      // Mettre en cache
      pilets.forEach((pilet: ClaugerPiletMetadata) => {
        this.cache.set(`${pilet.name}@${pilet.version}`, pilet)
      })

      return pilets
    } catch (error) {
      console.warn('[FeedService] Failed to fetch pilets:', error)
      return []
    }
  }

  /**
   * Vérifie si l'utilisateur a accès à un pilet
   */
  hasAccessToPilet(pilet: ClaugerPiletMetadata): boolean {
    // TODO: Implémenter la vérification des permissions
    // Pour le moment, tous les pilets sont accessibles
    return true
  }

  /**
   * Retourne des pilets mockés pour le développement
   */
  private getMockPilets(): ClaugerPiletMetadata[] {
    return [
      {
        name: '@clauger/dashboard-pilet',
        version: '1.0.0',
        link: '/mock/dashboard-pilet.js',
        requireRef: 'dashboardPilet',
        spec: 'v2',
        config: {
          permissions: ['USER'],
        },
      },
      {
        name: '@clauger/sidebar-pilet',
        version: '1.0.0',
        link: '/mock/sidebar-pilet.js',
        requireRef: 'sidebarPilet',
        spec: 'v2',
        config: {
          permissions: ['USER'],
        },
      },
    ]
  }

  /**
   * Récupère un pilet spécifique
   */
  async getPilet(name: string, version?: string): Promise<ClaugerPiletMetadata | null> {
    const key = version ? `${name}@${version}` : name
    
    // Vérifier le cache d'abord
    const cached = Array.from(this.cache.values()).find(p => 
      version ? `${p.name}@${p.version}` === key : p.name === name
    )
    
    if (cached) {
      return cached
    }

    // Sinon récupérer tous les pilets et chercher
    const pilets = await this.getAvailablePilets()
    return pilets.find(p => 
      version ? `${p.name}@${p.version}` === key : p.name === name
    ) || null
  }

  /**
   * Invalide le cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// Export singleton
export const feedService = new FeedService()