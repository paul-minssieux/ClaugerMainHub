/**
 * Instance Piral principale
 * UC 1.2 - Configuration de l'orchestrateur micro-frontend
 */

import React from 'react'
import { Piral } from 'piral'
import { getPiralInstance } from './create-instance'
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from '@/theme/accessible-theme'
import { ErrorBoundary } from './error-components'
import type { PiralInstance } from './create-instance'

/**
 * Instance Piral configurée et exportée
 */
export const instance = getPiralInstance()

/**
 * Composant racine de l'application avec tous les providers
 */
export const PiralApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <Piral instance={instance} />
      </ChakraProvider>
    </ErrorBoundary>
  )
}

// Export des types pour les pilets
export type { PiralInstance }
export type PiletApi = PiralInstance extends { createApi: (pilet: any) => infer T } ? T : never

// Configuration globale pour le développement
if (import.meta.env.DEV) {
  ;(window as any).dbg = {
    instance,
  }
  
  console.log('🚀 ClaugerMainHub Piral Instance initialized', {
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.MODE,
  })
}

// Hot Module Replacement support
if (import.meta.hot) {
  import.meta.hot.accept('./create-instance', () => {
    console.log('🔄 Hot reloading Piral instance...')
    window.location.reload()
  })
}

// Re-export components from error-components for backwards compatibility
export { LoadingIndicator, ErrorInfo, NotFound as NotFoundPage, PageError as LoadingError } from './error-components'
export { Layout } from './layout'

// Export fetch function from feed service
export { feedService } from '../feed/feed-service'
export const fetchPilets = () => feedService.getAvailablePilets()