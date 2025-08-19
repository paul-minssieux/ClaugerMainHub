import { ChakraProvider, Box, Flex, Heading, Text } from '@chakra-ui/react'
import { theme } from '@/theme/accessible-theme'
import { FocusManager } from '@/accessibility/FocusManager'
import { useEffect } from 'react'
import { ContentSecurityPolicy } from '@/security/csp'

function App() {
  useEffect(() => {
    // Générer un nonce pour cette session
    const nonce = ContentSecurityPolicy.generateNonce()
    
    // Créer la politique CSP
    const csp = new ContentSecurityPolicy({
      nonce,
      mode: import.meta.env.MODE as 'development' | 'production',
      reportUri: import.meta.env.VITE_CSP_REPORT_URI
    })
    
    // Ajouter le meta tag CSP
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = csp.getHeaderValue()
    document.head.appendChild(meta)
    
    // Cleanup
    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  return (
    <ChakraProvider theme={theme}>
      <FocusManager>
        <div className="app-container">
          {/* Skip Navigation Links */}
          <a href="#main-content" className="skip-link">
            Aller au contenu principal
          </a>
          <a href="#main-navigation" className="skip-link">
            Aller à la navigation
          </a>
          
          {/* Live Region pour les annonces */}
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
                ClaugerMainHub
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
                <Text>Navigation à venir</Text>
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
                <Heading as="h2" size="md" mb={4}>
                  Bienvenue sur ClaugerMainHub
                </Heading>
                <Text>
                  Architecture React/TypeScript avec Vite configurée avec succès.
                </Text>
                <Text mt={4} fontSize="sm" color="gray.600">
                  ✅ TypeScript strict mode
                  <br />
                  ✅ Accessibilité WCAG 2.1 AA
                  <br />
                  ✅ Sécurité CSP et XSS protection
                  <br />
                  ✅ EventBus pour communication
                  <br />
                  ✅ API contract pour micro-frontends
                </Text>
              </Box>
            </Flex>
          </Flex>
        </div>
      </FocusManager>
    </ChakraProvider>
  )
}

export default App
