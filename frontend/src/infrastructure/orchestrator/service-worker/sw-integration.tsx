/**
 * Composant React pour l'intégration du Service Worker
 * UC 1.2 - Interface utilisateur pour le Service Worker
 */

import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Text,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Progress,
  Badge,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react'
import { FiRefreshCw, FiWifi, FiWifiOff, FiDownload, FiInfo } from 'react-icons/fi'
import { serviceWorkerManager, ServiceWorkerState } from './sw-manager'
import { eventBus } from '@/core/services/event-bus.service'

/**
 * Hook pour gérer l'état du Service Worker
 */
export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>(
    serviceWorkerManager.getState()
  )
  const [cacheSize, setCacheSize] = useState<{
    usage: number
    quota: number
    percentage: number
  } | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    // Écouter les changements d'état
    const handlers = [
      eventBus.on('service-worker:initialized', () => {
        setState(serviceWorkerManager.getState())
      }),
      eventBus.on('service-worker:updated', () => {
        setState(serviceWorkerManager.getState())
      }),
      eventBus.on('service-worker:error', () => {
        setState(serviceWorkerManager.getState())
      }),
    ]

    // Écouter les changements de connexion
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Récupérer la taille du cache
    if (state.isActive) {
      serviceWorkerManager.getCacheSize()
        .then(setCacheSize)
        .catch(console.error)
    }

    return () => {
      handlers.forEach(handler => handler())
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [state.isActive])

  return {
    state,
    cacheSize,
    isOnline,
    checkForUpdates: () => serviceWorkerManager.checkForUpdates(),
    clearCache: () => serviceWorkerManager.clearCache(),
    skipWaiting: () => serviceWorkerManager.skipWaiting(),
  }
}

/**
 * Bannière de mise à jour du Service Worker
 */
export const ServiceWorkerUpdateBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false)
  const toast = useToast()

  useEffect(() => {
    const handler = eventBus.on('service-worker:update-ready', ({ skipWaiting }) => {
      setShowBanner(true)
    })

    return () => handler()
  }, [])

  const handleUpdate = async () => {
    try {
      await serviceWorkerManager.skipWaiting()
      setShowBanner(false)
      
      toast({
        title: 'Mise à jour installée',
        description: 'L\'application va se recharger',
        status: 'success',
        duration: 3000,
      })
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'installer la mise à jour',
        status: 'error',
        duration: 5000,
      })
    }
  }

  if (!showBanner) return null

  return (
    <Alert
      status="info"
      variant="solid"
      position="fixed"
      bottom={4}
      right={4}
      width="auto"
      maxWidth="md"
      borderRadius="md"
      boxShadow="lg"
      zIndex={9999}
    >
      <AlertIcon />
      <Box flex="1">
        <AlertTitle>Nouvelle version disponible!</AlertTitle>
        <AlertDescription>
          Une mise à jour de l'application est prête à être installée.
        </AlertDescription>
      </Box>
      <HStack spacing={2} ml={4}>
        <Button
          size="sm"
          colorScheme="white"
          variant="outline"
          onClick={() => setShowBanner(false)}
        >
          Plus tard
        </Button>
        <Button
          size="sm"
          colorScheme="white"
          variant="solid"
          leftIcon={<FiRefreshCw />}
          onClick={handleUpdate}
        >
          Mettre à jour
        </Button>
      </HStack>
      <CloseButton
        position="absolute"
        right="8px"
        top="8px"
        onClick={() => setShowBanner(false)}
      />
    </Alert>
  )
}

/**
 * Indicateur d'état hors ligne
 */
export const OfflineIndicator: React.FC = () => {
  const { isOnline } = useServiceWorker()
  const [show, setShow] = useState(!isOnline)

  useEffect(() => {
    if (!isOnline) {
      setShow(true)
    } else {
      // Masquer après un délai
      const timer = setTimeout(() => setShow(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  if (!show) return null

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bg={isOnline ? 'green.500' : 'orange.500'}
      color="white"
      py={2}
      px={4}
      zIndex={9999}
      transition="all 0.3s"
    >
      <HStack justify="center" spacing={2}>
        {isOnline ? <FiWifi /> : <FiWifiOff />}
        <Text fontSize="sm" fontWeight="medium">
          {isOnline 
            ? 'Connexion restaurée' 
            : 'Mode hors ligne - Utilisation du cache'}
        </Text>
      </HStack>
    </Box>
  )
}

/**
 * Widget de statut du Service Worker
 */
export const ServiceWorkerStatus: React.FC = () => {
  const { state, cacheSize, isOnline, checkForUpdates, clearCache } = useServiceWorker()
  const { isOpen, onToggle } = useDisclosure()
  const toast = useToast()

  const handleCheckUpdates = async () => {
    try {
      await checkForUpdates()
      toast({
        title: 'Vérification effectuée',
        description: 'Aucune mise à jour disponible',
        status: 'info',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de vérifier les mises à jour',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleClearCache = async () => {
    try {
      await clearCache()
      toast({
        title: 'Cache vidé',
        description: 'Le cache a été vidé avec succès',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de vider le cache',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <Box
      borderWidth={1}
      borderRadius="lg"
      p={4}
      bg="white"
      boxShadow="sm"
    >
      <HStack justify="space-between" mb={2}>
        <HStack spacing={3}>
          <Badge
            colorScheme={state.isActive ? 'green' : 'gray'}
            fontSize="sm"
            px={2}
            py={1}
            borderRadius="md"
          >
            {state.isActive ? 'Actif' : 'Inactif'}
          </Badge>
          <Badge
            colorScheme={isOnline ? 'green' : 'orange'}
            fontSize="sm"
            px={2}
            py={1}
            borderRadius="md"
          >
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </Badge>
        </HStack>
        <IconButton
          aria-label="Détails"
          icon={<FiInfo />}
          size="sm"
          variant="ghost"
          onClick={onToggle}
        />
      </HStack>

      <Collapse in={isOpen} animateOpacity>
        <VStack spacing={4} align="stretch" mt={4}>
          {/* Statistiques du cache */}
          {cacheSize && (
            <Box>
              <Text fontSize="sm" fontWeight="semibold" mb={2}>
                Utilisation du cache
              </Text>
              <Progress
                value={cacheSize.percentage}
                size="sm"
                colorScheme={cacheSize.percentage > 80 ? 'red' : 'blue'}
                borderRadius="md"
                mb={1}
              />
              <Text fontSize="xs" color="gray.600">
                {formatBytes(cacheSize.usage)} / {formatBytes(cacheSize.quota)}
                {' '}({cacheSize.percentage.toFixed(1)}%)
              </Text>
            </Box>
          )}

          {/* État du Service Worker */}
          <VStack align="stretch" spacing={2}>
            <Stat size="sm">
              <StatLabel>Service Worker</StatLabel>
              <StatNumber fontSize="md">
                {state.isSupported ? 'Supporté' : 'Non supporté'}
              </StatNumber>
              <StatHelpText>
                {state.isRegistered ? 'Enregistré' : 'Non enregistré'}
                {state.isUpdating && ' - Mise à jour en cours'}
              </StatHelpText>
            </Stat>
          </VStack>

          {/* Actions */}
          <HStack spacing={2}>
            <Button
              size="sm"
              leftIcon={<FiRefreshCw />}
              onClick={handleCheckUpdates}
              isDisabled={!state.isActive || state.isUpdating}
            >
              Vérifier MAJ
            </Button>
            <Button
              size="sm"
              leftIcon={<FiDownload />}
              onClick={handleClearCache}
              isDisabled={!state.isActive}
              variant="outline"
            >
              Vider cache
            </Button>
          </HStack>

          {/* Erreur éventuelle */}
          {state.error && (
            <Alert status="error" borderRadius="md" fontSize="sm">
              <AlertIcon />
              <AlertDescription>{state.error.message}</AlertDescription>
            </Alert>
          )}
        </VStack>
      </Collapse>
    </Box>
  )
}

/**
 * Provider pour le Service Worker
 */
interface ServiceWorkerProviderProps {
  children: React.ReactNode
  enabled?: boolean
}

export const ServiceWorkerProvider: React.FC<ServiceWorkerProviderProps> = ({
  children,
  enabled = true,
}) => {
  useEffect(() => {
    if (enabled && import.meta.env.PROD) {
      serviceWorkerManager.initialize().catch(console.error)
    }
  }, [enabled])

  return (
    <>
      {children}
      <ServiceWorkerUpdateBanner />
      <OfflineIndicator />
    </>
  )
}

/**
 * Hook pour précharger des ressources
 */
export function usePreloadResources(resources: string[]) {
  useEffect(() => {
    if (!serviceWorkerManager.getState().isActive) {
      return
    }

    // Précharger les ressources via le Service Worker
    resources.forEach(resource => {
      fetch(resource, { cache: 'force-cache' }).catch(console.error)
    })
  }, [resources])
}

/**
 * Hook pour la synchronisation en arrière-plan
 */
export function useBackgroundSync(tag: string, callback: () => Promise<void>) {
  useEffect(() => {
    if (!serviceWorkerManager.getState().isActive) {
      return
    }

    const registration = serviceWorkerManager.getState().registration
    if (!registration || !('sync' in registration)) {
      return
    }

    // Enregistrer la synchronisation
    ;(registration as any).sync.register(tag).catch(console.error)

    // Écouter l'événement de synchronisation
    const handler = eventBus.on(`service-worker:sync:${tag}`, callback)

    return () => handler()
  }, [tag, callback])
}