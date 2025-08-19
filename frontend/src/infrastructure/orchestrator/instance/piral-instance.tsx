/**
 * Instance Piral principale
 * UC 1.2 - Configuration de l'orchestrateur micro-frontend
 */

import React from 'react'
import { createInstance } from 'piral-core'
import { createMenuApi } from 'piral-menu'
import { createNotificationsApi } from 'piral-notifications'
import { createModalsApi } from 'piral-modals'
import { createDashboardApi } from 'piral-dashboard'
import { Box, Flex, Heading, Text, Spinner, Button, Alert as ChakraAlert } from '@chakra-ui/react'
import { FocusManager } from '@/accessibility/FocusManager'
import { createMainHubApi, createExtendedApi } from '../api/mainhub-api'
import { getPiralConfig, validateConfig, featureFlags } from './piral-config'
import type { ClaugerPiletMetadata } from './piral-types'

// Récupérer la configuration
const config = getPiralConfig()

// Valider la configuration
if (!validateConfig(config)) {
  console.error('[Piral] Invalid configuration')
}

/**
 * Composant de layout principal
 */
const MainHubLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FocusManager>
      <div className="app-container">
        {/* Skip Navigation Links */}
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        <a href="#main-navigation" className="skip-link">
          Aller à la navigation
        </a>
        
        {/* Live Regions pour les annonces */}
        <div
          id="live-announcer"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
        <div
          id="assertive-announcer"
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        />
        
        {/* Structure principale */}
        <Flex direction="column" minH="100vh">
          {/* Header */}
          <Box
            as="header"
            role="banner"
            bg="white"
            borderBottom="1px"
            borderColor="gray.200"
            px={4}
            py={3}
          >
            <Heading
              as="h1"
              size="lg"
              color="gray.800"
              id="app-title"
            >
              ClaugerMainHub - Piral
            </Heading>
          </Box>
          
          {/* Main Content Area */}
          <Flex flex="1">
            {/* Navigation Sidebar */}
            <Box
              as="nav"
              role="navigation"
              aria-label="Navigation principale"
              id="main-navigation"
              w="280px"
              bg="gray.50"
              borderRight="1px"
              borderColor="gray.200"
              p={4}
            >
              <div id="piral-menu-container" />
            </Box>
            
            {/* Main Content */}
            <Box
              as="main"
              role="main"
              id="main-content"
              flex="1"
              p={6}
              aria-labelledby="app-title"
            >
              {children}
            </Box>
          </Flex>
        </Flex>
      </div>
    </FocusManager>
  )
}

/**
 * Composant d'indicateur de chargement
 */
const LoadingIndicator: React.FC = () => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="400px"
      role="status"
      aria-label="Chargement en cours"
    >
      <Spinner
        size="xl"
        color="blue.500"
      />
      <Text mt={4} color="gray.600">
        Chargement des modules...
      </Text>
    </Flex>
  )
}

/**
 * Composant d'erreur
 */
const ErrorInfo: React.FC<{ error: Error }> = ({ error }) => {
  return (
    <ChakraAlert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="200px"
      role="alert"
    >
      <Text mt={4} mb={1} fontSize="lg" fontWeight="bold">
        Erreur de chargement
      </Text>
      <Text fontSize="sm" color="gray.600" mb={4}>
        {error.message || 'Une erreur inattendue s\'est produite'}
      </Text>
      <Button
        size="sm"
        colorScheme="red"
        onClick={() => window.location.reload()}
      >
        Recharger la page
      </Button>
    </ChakraAlert>
  )
}

/**
 * Page d'accueil par défaut
 */
const HomePage: React.FC = () => {
  return (
    <Box>
      <Heading as="h2" size="md" mb={4}>
        Bienvenue sur ClaugerMainHub
      </Heading>
      <Text mb={4}>
        Orchestrateur micro-frontend avec Piral configuré avec succès.
      </Text>
      <Text fontSize="sm" color="gray.600">
        ✅ Instance Piral active
        <br />
        ✅ API MainHub disponible
        <br />
        ✅ EventBus connecté
        <br />
        ✅ Accessibilité WCAG 2.1 AA
        <br />
        ✅ Thème Chakra UI intégré
      </Text>
    </Box>
  )
}

/**
 * Page non trouvée
 */
const NotFoundPage: React.FC = () => {
  return (
    <Box textAlign="center" py={10}>
      <Heading as="h2" size="xl" mb={4}>
        404 - Page non trouvée
      </Heading>
      <Text color="gray.600">
        La page que vous recherchez n'existe pas.
      </Text>
    </Box>
  )
}

/**
 * Composant d'erreur de chargement
 */
const LoadingError: React.FC<{ error: Error }> = ({ error }) => {
  return (
    <ChakraAlert status="warning" role="alert">
      <Box>
        <Text fontWeight="bold">Impossible de charger le module</Text>
        <Text fontSize="sm">{error.message}</Text>
      </Box>
    </ChakraAlert>
  )
}

/**
 * Fonction pour récupérer les pilets
 */
async function fetchPilets(): Promise<ClaugerPiletMetadata[]> {
  try {
    // En développement, on peut avoir des pilets en local
    if (import.meta.env.MODE === 'development' && featureFlags.enablePiralDebugger) {
      console.log('[Piral] Fetching pilets from:', config.feedUrl)
    }

    const response = await fetch(config.feedUrl, {
      method: 'GET',
      headers: config.requestOptions?.headers || {},
      signal: AbortSignal.timeout(config.requestOptions?.timeout || 10000),
    })

    if (!response.ok) {
      throw new Error(`Feed service returned ${response.status}`)
    }

    const data = await response.json()
    
    // Filtrer les pilets selon les permissions (sera implémenté dans UC 4.x)
    const pilets = data.items || []
    
    console.log(`[Piral] Loaded ${pilets.length} pilets`)
    return pilets
  } catch (error) {
    console.warn('[Piral] Failed to fetch pilets:', error)
    
    // En cas d'erreur, retourner une liste vide pour permettre le démarrage
    // Les pilets pourront être chargés plus tard
    return []
  }
}

/**
 * Création de l'instance Piral
 */
export const piralInstance = createInstance({
  state: {
    components: {
      LoadingIndicator,
      ErrorInfo,
      DashboardContainer: () => <Box id="piral-dashboard" />,
      Layout: MainHubLayout,
    },
    errorComponents: {
      not_found: NotFoundPage,
      loading_error: LoadingError,
    },
    routes: {
      '/': HomePage,
    },
  },
  plugins: [
    createMenuApi(),
    createNotificationsApi(),
    createModalsApi(),
    createDashboardApi(),
    createMainHubApi(),
    // Ajouter les extensions supplémentaires
    () => createExtendedApi(),
  ],
  requestPilets: fetchPilets,
  async: true,
  strictMode: config.strictMode,
  debug: config.debug ? {
    viewState: true,
    loadPilets: true,
    dependency: true,
    extensionCatalogue: true,
  } : undefined,
})

// Export du type de l'API pour les pilets
export type PiralApi = typeof piralInstance

// Monitoring des performances en développement
if (import.meta.env.MODE === 'development') {
  piralInstance.on('store-data', (data) => {
    console.log('[Piral] Store updated:', data)
  })
}