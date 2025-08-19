/**
 * Template Pilet pour ClaugerMainHub
 * 
 * Ce fichier sert de point d'entrée pour créer un nouveau pilet.
 * Il démontre l'utilisation de l'API MainHub et les bonnes pratiques.
 */

import * as React from 'react'
import type { PiletApi } from '@clauger/mainhub-types'
import { Box, Heading, Text, Button, useToast } from '@chakra-ui/react'

/**
 * Fonction principale du pilet
 * Cette fonction est appelée par Piral lors du chargement du pilet
 */
export function setup(api: PiletApi) {
  console.log('[Template Pilet] Setting up...')

  // Enregistrer une page
  api.registerPage('/template', () => <TemplatePage api={api} />)

  // Enregistrer un élément de menu
  api.registerMenu({
    type: 'general',
    name: 'Template',
    href: '/template',
    icon: '📄',
  })

  // Enregistrer un widget pour le dashboard
  api.registerWidget({
    id: 'template-widget',
    name: 'Template Widget',
    component: () => <TemplateWidget api={api} />,
    defaultSize: { width: 2, height: 2 },
    permissions: ['USER'],
  })

  // Enregistrer une extension
  api.registerExtension('header-items', () => <HeaderItem api={api} />)

  // S'abonner à des événements
  const unsubscribe = api.subscribeToEvent('user:login', (data) => {
    console.log('[Template Pilet] User logged in:', data)
  })

  // Retourner une fonction de nettoyage (optionnel)
  return () => {
    console.log('[Template Pilet] Cleaning up...')
    unsubscribe()
  }
}

/**
 * Composant de page principale
 */
const TemplatePage: React.FC<{ api: PiletApi }> = ({ api }) => {
  const toast = useToast()
  const [user, setUser] = React.useState(null)
  const [config, setConfig] = React.useState(null)

  React.useEffect(() => {
    // Récupérer les informations utilisateur
    api.getCurrentUser().then(setUser)
    
    // Récupérer la configuration
    api.getConfiguration().then(setConfig)
  }, [api])

  const handleNotification = () => {
    // Utiliser l'API étendue pour les notifications
    api.notifications.showSuccess('Notification de test envoyée!')
    
    // Ou utiliser Chakra UI Toast
    toast({
      title: 'Notification',
      description: 'Ceci est une notification Chakra UI',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleThemeSwitch = () => {
    const currentTheme = api.theme.getCurrentTheme()
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    api.theme.switchTheme(newTheme)
  }

  return (
    <Box p={6}>
      <Heading as="h1" size="xl" mb={4}>
        Template Pilet
      </Heading>
      
      <Text mb={4}>
        Ceci est un pilet de template pour ClaugerMainHub.
      </Text>

      {user && (
        <Box mb={4} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold">Utilisateur connecté:</Text>
          <Text>{user.name} ({user.email})</Text>
          <Text>Rôles: {user.roles?.join(', ')}</Text>
        </Box>
      )}

      {config && (
        <Box mb={4} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold">Configuration:</Text>
          <Text>Environnement: {config.environment}</Text>
          <Text>Version: {config.version}</Text>
          <Text>API URL: {config.apiBaseUrl}</Text>
        </Box>
      )}

      <Box>
        <Button colorScheme="blue" mr={2} onClick={handleNotification}>
          Envoyer une notification
        </Button>
        <Button colorScheme="purple" onClick={handleThemeSwitch}>
          Changer le thème
        </Button>
      </Box>
    </Box>
  )
}

/**
 * Composant widget pour le dashboard
 */
const TemplateWidget: React.FC<{ api: PiletApi }> = ({ api }) => {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    // Exemple d'utilisation de l'EventBus
    const handler = (data: any) => {
      console.log('[Template Widget] Event received:', data)
    }
    
    api.eventBus.on('dashboard:refresh', handler)
    
    return () => {
      api.eventBus.off('dashboard:refresh', handler)
    }
  }, [api])

  return (
    <Box p={4} height="100%" bg="gray.50" borderRadius="md">
      <Heading as="h3" size="sm" mb={2}>
        Template Widget
      </Heading>
      <Text mb={4}>Compteur: {count}</Text>
      <Button size="sm" onClick={() => setCount(c => c + 1)}>
        Incrémenter
      </Button>
    </Box>
  )
}

/**
 * Composant d'extension pour le header
 */
const HeaderItem: React.FC<{ api: PiletApi }> = ({ api }) => {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => api.sendNotification('info', 'Header button clicked')}
    >
      📄 Template
    </Button>
  )
}