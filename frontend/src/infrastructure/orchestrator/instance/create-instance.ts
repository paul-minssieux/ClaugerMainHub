/**
 * Configuration et création de l'instance Piral
 * UC 1.2 - Instance principale de l'orchestrateur
 */

import { createInstance } from 'piral-core'
import { createStandardApi } from '../api/standard-api'
import { Layout } from './layout'
import * as errors from './error-components'
import { feedService } from '../feed/feed-service'
import type { PiralConfiguration } from 'piral-core'

/**
 * Configuration de l'instance Piral pour ClaugerMainHub
 */
export function createPiralInstance() {
  const configuration: PiralConfiguration = {
    state: {
      components: {
        LoadingIndicator: errors.LoadingIndicator,
        ErrorInfo: errors.ErrorInfo,
        NotFound: errors.NotFound,
        Layout: Layout,
      },
      errorComponents: {
        not_found: errors.NotFound,
        loading: errors.LoadingIndicator,
        page: errors.PageError,
        extension: errors.ExtensionError,
      },
      routes: {
        '/': Layout,
      },
    },
    plugins: [
      ...createStandardApi(),
    ],
    async: true,
    requestPilets: async () => {
      try {
        // Utilisation du feed service existant
        const availablePilets = await feedService.getAvailablePilets()
        
        // Filtrer les pilets selon les permissions utilisateur
        const userPilets = availablePilets.filter(pilet => 
          feedService.hasAccessToPilet(pilet)
        )
        
        return userPilets.map(pilet => ({
          ...pilet,
          // Ajout du cache buster pour forcer le rechargement si nécessaire
          link: `${pilet.link}?v=${pilet.version}`,
        }))
      } catch (error) {
        console.error('Failed to load pilets:', error)
        // Retourner un tableau vide en cas d'erreur pour permettre au shell de fonctionner
        return []
      }
    },
    // Configuration du cache
    availablePilets: [],
    // Activation du mode debug en développement
    debug: import.meta.env.DEV,
    // Configuration des stratégies de chargement
    loadPilet: {
      // Timeout de chargement pour chaque pilet (10 secondes)
      timeout: 10000,
      // Retry en cas d'échec
      retryCount: 2,
      retryDelay: 1000,
    },
  }

  return createInstance(configuration)
}

// Export de l'instance singleton
let instance: ReturnType<typeof createInstance> | null = null

export function getPiralInstance() {
  if (!instance) {
    instance = createPiralInstance()
  }
  return instance
}

// Types pour l'instance
export type PiralInstance = ReturnType<typeof createPiralInstance>