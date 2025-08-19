/**
 * Layout principal de l'application
 * UC 1.2 - Structure de base avec sidebar et content area
 */

import React, { useState, useCallback, useEffect } from 'react'
import {
  Box,
  Flex,
  useColorModeValue,
  useDisclosure,
  IconButton,
  VStack,
  Container,
  useBreakpointValue,
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import type { LayoutProps } from 'piral-core'

/**
 * Layout principal de l'application ClaugerMainHub
 * Fournit la structure de base avec sidebar, topbar et zone de contenu
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // Configuration responsive
  const isMobile = useBreakpointValue({ base: true, lg: false })
  const sidebarWidth = isSidebarCollapsed ? '60px' : '280px'
  
  // Couleurs selon le thème
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const contentBg = useColorModeValue('white', 'gray.800')
  
  // Gestion du collapse de la sidebar
  const handleSidebarToggle = useCallback(() => {
    if (isMobile) {
      isOpen ? onClose() : onOpen()
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed)
    }
  }, [isMobile, isOpen, onOpen, onClose, isSidebarCollapsed])
  
  // Fermeture automatique de la sidebar mobile lors du changement de route
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose()
    }
  }, [children, isMobile, isOpen, onClose])
  
  return (
    <Flex minH="100vh" bg={bgColor}>
      {/* Sidebar Desktop */}
      {!isMobile && (
        <Box
          w={sidebarWidth}
          transition="width 0.3s ease"
          borderRight="1px"
          borderColor={borderColor}
          bg={contentBg}
          position="fixed"
          h="100vh"
          zIndex={10}
          overflowY="auto"
        >
          <Box p={4}>
            <IconButton
              aria-label="Toggle sidebar"
              icon={<HamburgerIcon />}
              onClick={handleSidebarToggle}
              variant="ghost"
              size="sm"
            />
          </Box>
          {/* Le contenu de la sidebar sera ajouté par les pilets */}
          <Box id="sidebar-content" />
        </Box>
      )}
      
      {/* Sidebar Mobile (Drawer) */}
      {isMobile && (
        <Box
          position="fixed"
          left={isOpen ? 0 : '-100%'}
          top={0}
          w="280px"
          h="100vh"
          bg={contentBg}
          borderRight="1px"
          borderColor={borderColor}
          transition="left 0.3s ease"
          zIndex={999}
          overflowY="auto"
        >
          <Box p={4}>
            <IconButton
              aria-label="Close sidebar"
              icon={<HamburgerIcon />}
              onClick={onClose}
              variant="ghost"
              size="sm"
            />
          </Box>
          {/* Le contenu de la sidebar sera ajouté par les pilets */}
          <Box id="sidebar-content-mobile" />
        </Box>
      )}
      
      {/* Zone principale */}
      <Flex
        flex={1}
        ml={!isMobile ? sidebarWidth : 0}
        direction="column"
        transition="margin-left 0.3s ease"
      >
        {/* TopBar */}
        <Box
          position="sticky"
          top={0}
          zIndex={5}
          bg={contentBg}
          borderBottom="1px"
          borderColor={borderColor}
          px={4}
          py={2}
        >
          <Flex align="center" justify="space-between">
            {isMobile && (
              <IconButton
                aria-label="Toggle sidebar"
                icon={<HamburgerIcon />}
                onClick={handleSidebarToggle}
                variant="ghost"
                mr={2}
              />
            )}
            {/* Le contenu de la topbar sera ajouté par les pilets */}
            <Box id="topbar-content" flex={1} />
          </Flex>
        </Box>
        
        {/* Content Area */}
        <Box flex={1} p={4}>
          <Container maxW="container.xl" h="full">
            <VStack spacing={4} align="stretch" h="full">
              {children}
            </VStack>
          </Container>
        </Box>
      </Flex>
      
      {/* Overlay pour mobile */}
      {isMobile && isOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={998}
          onClick={onClose}
        />
      )}
    </Flex>
  )
}

Layout.displayName = 'Layout'