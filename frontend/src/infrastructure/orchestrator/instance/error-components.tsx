/**
 * Composants d'erreur pour l'orchestrateur Piral
 * UC 1.2 - Gestion des erreurs et états de chargement
 */

import React from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  Code,
} from '@chakra-ui/react'
import { WarningIcon, InfoIcon } from '@chakra-ui/icons'
import { FiHome, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi'
import type { ErrorInfoProps, LoadingIndicatorProps } from 'piral-core'

/**
 * Indicateur de chargement pour les pilets et pages
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = () => {
  const bgColor = useColorModeValue('white', 'gray.800')
  
  return (
    <Center minH="400px" p={8}>
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text color="gray.600" fontSize="lg">
          Chargement en cours...
        </Text>
      </VStack>
    </Center>
  )
}

/**
 * Composant d'erreur générique
 */
export const ErrorInfo: React.FC<ErrorInfoProps> = ({ 
  type, 
  error,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('red.200', 'red.700')
  
  const errorMessage = error?.message || 'Une erreur est survenue'
  const errorStack = error?.stack
  
  const getErrorTitle = () => {
    switch (type) {
      case 'not_found':
        return 'Page non trouvée'
      case 'loading':
        return 'Erreur de chargement'
      case 'page':
        return 'Erreur de page'
      case 'extension':
        return "Erreur d'extension"
      default:
        return 'Erreur'
    }
  }
  
  return (
    <Container maxW="container.md" py={8}>
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="400px"
        bg={bgColor}
        borderWidth={2}
        borderColor={borderColor}
        borderRadius="lg"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          {getErrorTitle()}
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          <VStack spacing={4}>
            <Text>{errorMessage}</Text>
            {import.meta.env.DEV && errorStack && (
              <Box w="full">
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Stack trace:
                </Text>
                <Code
                  p={2}
                  fontSize="xs"
                  maxH="150px"
                  overflowY="auto"
                  whiteSpace="pre-wrap"
                  wordBreak="break-word"
                >
                  {errorStack}
                </Code>
              </Box>
            )}
            <Button
              colorScheme="blue"
              leftIcon={<FiRefreshCw />}
              onClick={() => window.location.reload()}
            >
              Rafraîchir
            </Button>
          </VStack>
        </AlertDescription>
      </Alert>
    </Container>
  )
}

/**
 * Page 404 - Not Found
 */
export const NotFound: React.FC = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  
  return (
    <Center minH="calc(100vh - 200px)" bg={bgColor}>
      <VStack spacing={6}>
        <Icon as={InfoIcon} w={20} h={20} color="blue.500" />
        <Heading size="2xl">404</Heading>
        <Text fontSize="xl" color={textColor}>
          Page non trouvée
        </Text>
        <Text color={textColor} textAlign="center" maxW="md">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </Text>
        <Button
          colorScheme="blue"
          leftIcon={<FiHome />}
          onClick={() => window.location.href = '/'}
        >
          Retour à l'accueil
        </Button>
      </VStack>
    </Center>
  )
}

/**
 * Erreur de page complète
 */
export const PageError: React.FC<{ error?: Error }> = ({ error }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  
  return (
    <Container maxW="container.lg" py={10}>
      <Box
        bg={bgColor}
        borderRadius="lg"
        shadow="lg"
        p={8}
      >
        <VStack spacing={6} align="center">
          <Icon as={FiAlertTriangle} w={16} h={16} color="orange.500" />
          <Heading size="xl">Erreur de page</Heading>
          <Text fontSize="lg" color="gray.600" textAlign="center">
            {error?.message || 'Une erreur inattendue est survenue lors du chargement de cette page.'}
          </Text>
          <VStack spacing={3}>
            <Button
              colorScheme="blue"
              leftIcon={<FiRefreshCw />}
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
            <Button
              variant="ghost"
              leftIcon={<FiHome />}
              onClick={() => window.location.href = '/'}
            >
              Retour à l'accueil
            </Button>
          </VStack>
          {import.meta.env.DEV && error?.stack && (
            <Box w="full" mt={6}>
              <Text fontSize="sm" color="gray.500" mb={2}>
                Détails techniques:
              </Text>
              <Code
                p={4}
                fontSize="xs"
                maxH="200px"
                overflowY="auto"
                whiteSpace="pre-wrap"
                wordBreak="break-word"
                bg="gray.100"
                borderRadius="md"
              >
                {error.stack}
              </Code>
            </Box>
          )}
        </VStack>
      </Box>
    </Container>
  )
}

/**
 * Erreur d'extension/pilet
 */
export const ExtensionError: React.FC<{ error?: Error; piletName?: string }> = ({ 
  error, 
  piletName 
}) => {
  const bgColor = useColorModeValue('yellow.50', 'gray.800')
  const borderColor = useColorModeValue('yellow.400', 'yellow.600')
  
  return (
    <Alert
      status="warning"
      variant="left-accent"
      bg={bgColor}
      borderColor={borderColor}
      borderRadius="md"
      p={4}
    >
      <AlertIcon />
      <Box>
        <AlertTitle>
          Erreur d'extension {piletName ? `(${piletName})` : ''}
        </AlertTitle>
        <AlertDescription>
          <Text fontSize="sm" mt={2}>
            {error?.message || 'Cette extension a rencontré un problème et ne peut pas être chargée.'}
          </Text>
          {import.meta.env.DEV && (
            <Text fontSize="xs" color="gray.500" mt={2}>
              Consultez la console pour plus de détails
            </Text>
          )}
        </AlertDescription>
      </Box>
    </Alert>
  )
}

/**
 * Composant d'erreur pour les boundaries
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || PageError
      return <Fallback error={this.state.error} />
    }
    
    return this.props.children
  }
}