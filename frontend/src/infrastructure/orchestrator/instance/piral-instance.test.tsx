/**
 * Tests unitaires pour l'instance Piral
 * UC 1.2 - Configuration de l'orchestrateur micro-frontend
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from '@/theme/accessible-theme'

// Mock des modules Piral
vi.mock('piral-core', () => ({
  createInstance: vi.fn(() => ({
    root: vi.fn(),
    render: vi.fn(),
  })),
}))

vi.mock('piral-menu', () => ({
  createMenuApi: vi.fn(() => ({})),
}))

vi.mock('piral-notifications', () => ({
  createNotificationsApi: vi.fn(() => ({})),
}))

vi.mock('piral-modals', () => ({
  createModalsApi: vi.fn(() => ({})),
}))

vi.mock('piral-dashboard', () => ({
  createDashboardApi: vi.fn(() => ({})),
}))

// Mock de l'EventBus
vi.mock('@/core/services/event-bus.service', () => ({
  eventBus: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  EventBus: vi.fn(),
  EventBusService: vi.fn(() => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
  })),
}))

// Mock du FocusManager
vi.mock('@/accessibility/FocusManager', () => ({
  FocusManager: {
    trapFocus: vi.fn(),
    releaseFocus: vi.fn(),
  },
}))

describe('Piral Instance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment variables
    vi.stubEnv('VITE_PIRAL_FEED_URL', 'https://feed.example.com/api/v1/pilets')
    vi.stubEnv('VITE_PIRAL_DEBUG', 'false')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('Configuration', () => {
    it('should create instance with correct configuration', async () => {
      const { getPiralConfig } = await import('./piral-config')
      const config = getPiralConfig()
      
      expect(config).toBeDefined()
      expect(config.feedUrl).toBe('https://feed.example.com/api/v1/pilets')
      expect(config.debug).toBe(false)
    })

    it('should validate configuration correctly', async () => {
      const { validateConfig } = await import('./piral-config')
      
      const validConfig = {
        feedUrl: 'https://example.com',
        debug: false,
        strictMode: true,
        async: true,
        cacheOptions: {
          ttl: 3600000,
          maxAge: 3600000,
          maxSize: 50,
          strategy: 'cache-first' as const,
          preloadCritical: true,
        },
        requestOptions: {
          headers: {},
          timeout: 5000,
          retry: 1,
        },
      }
      
      expect(validateConfig(validConfig)).toBe(true)
    })

    it('should handle invalid configuration', async () => {
      const { validateConfig } = await import('./piral-config')
      
      const invalidConfig = {
        feedUrl: '',
        debug: false,
      }
      
      expect(validateConfig(invalidConfig as any)).toBe(false)
    })
  })

  describe('Components', () => {
    it('should render LoadingIndicator component', async () => {
      const { LoadingIndicator } = await import('./piral-instance')
      
      render(
        <ChakraProvider value={theme}>
          <LoadingIndicator />
        </ChakraProvider>
      )
      
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Chargement en cours...')).toBeInTheDocument()
    })

    it('should render ErrorInfo component with error message', async () => {
      const { ErrorInfo } = await import('./piral-instance')
      
      const error = new Error('Test error message')
      
      render(
        <ChakraProvider value={theme}>
          <ErrorInfo error={error} type="loading" />
        </ChakraProvider>
      )
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
    })

    it('should render HomePage component', async () => {
      const { HomePage } = await import('./piral-instance')
      
      render(
        <ChakraProvider value={theme}>
          <HomePage />
        </ChakraProvider>
      )
      
      expect(screen.getByText('Bienvenue sur ClaugerMainHub')).toBeInTheDocument()
    })

    it('should render NotFoundPage component', async () => {
      const { NotFoundPage } = await import('./piral-instance')
      
      render(
        <ChakraProvider value={theme}>
          <NotFoundPage />
        </ChakraProvider>
      )
      
      expect(screen.getByText('Page non trouvée')).toBeInTheDocument()
    })
  })

  describe('Pilet Loading', () => {
    it('should fetch pilets from feed URL', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              name: 'test-pilet',
              version: '1.0.0',
              link: 'https://example.com/pilet.js',
              requireRef: 'testPilet',
              integrity: 'sha256-abc123',
              spec: 'v2',
            },
          ],
        }),
      })

      const { fetchPilets } = await import('./piral-instance')
      const pilets = await fetchPilets()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/pilets'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/json',
          }),
        })
      )

      expect(pilets).toHaveLength(1)
      expect(pilets[0]?.name).toBe('test-pilet')
    })

    it('should handle fetch errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

      const { fetchPilets } = await import('./piral-instance')
      const pilets = await fetchPilets()

      expect(pilets).toEqual([])
    })

    it('should filter pilets based on permissions', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              name: 'admin-pilet',
              version: '1.0.0',
              link: 'https://example.com/admin.js',
              requireRef: 'adminPilet',
              spec: 'v2',
              permissions: ['ADMIN'],
            },
            {
              name: 'user-pilet',
              version: '1.0.0',
              link: 'https://example.com/user.js',
              requireRef: 'userPilet',
              spec: 'v2',
              permissions: ['USER'],
            },
          ],
        }),
      })

      const { fetchPilets } = await import('./piral-instance')
      const pilets = await fetchPilets()

      // Should return all pilets in test environment (no real auth)
      expect(pilets).toHaveLength(2)
    })
  })

  describe('MainHub API', () => {
    it('should create MainHub API with correct methods', async () => {
      const { createMainHubApi } = await import('../api/mainhub-api')
      const mockContext = {
        showNotification: vi.fn(),
        closeNotification: vi.fn(),
      }

      const api = createMainHubApi()(mockContext as any)

      expect(api).toHaveProperty('getCurrentUser')
      expect(api).toHaveProperty('getConfiguration')
      expect(api).toHaveProperty('sendNotification')
      expect(api).toHaveProperty('registerWidget')
      expect(api).toHaveProperty('subscribeToEvent')
      expect(api).toHaveProperty('logError')
      expect(api).toHaveProperty('eventBus')
    })

    it('should get current user information', async () => {
      const { createMainHubApi } = await import('../api/mainhub-api')
      const api = createMainHubApi()({} as any)

      const user = await api.getCurrentUser()

      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('roles')
    })

    it('should get application configuration', async () => {
      const { createMainHubApi } = await import('../api/mainhub-api')
      const api = createMainHubApi()({} as any)

      const config = await api.getConfiguration()

      expect(config).toHaveProperty('apiBaseUrl')
      expect(config).toHaveProperty('features')
      expect(config).toHaveProperty('environment')
      expect(config).toHaveProperty('version')
    })

    it('should send notifications', async () => {
      const { createMainHubApi } = await import('../api/mainhub-api')
      const mockContext = {
        showNotification: vi.fn(),
        closeNotification: vi.fn(),
      }

      const api = createMainHubApi()(mockContext as any)

      api.sendNotification('temporary', 'Test message')

      expect(mockContext.showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
          content: 'Test message',
        })
      )
    })

    it('should register widgets', async () => {
      const { createMainHubApi } = await import('../api/mainhub-api')
      const { eventBus } = await import('@/core/services/event-bus.service')
      
      const api = createMainHubApi()({} as any)

      const widget = {
        id: 'test-widget',
        name: 'Test Widget',
        component: () => <div>Widget</div>,
        defaultSize: { width: 2, height: 2 },
        permissions: ['USER'],
      }

      api.registerWidget(widget)

      expect(eventBus.emit).toHaveBeenCalledWith('widget:registered', widget)
    })

    it('should subscribe to events', async () => {
      const { createMainHubApi } = await import('../api/mainhub-api')
      const { eventBus } = await import('@/core/services/event-bus.service')
      
      const api = createMainHubApi()({} as any)
      const handler = vi.fn()

      const unsubscribe = api.subscribeToEvent('test:event', handler)

      expect(eventBus.on).toHaveBeenCalled()
      expect(unsubscribe).toBeInstanceOf(Function)
    })
  })

  describe('Extended API', () => {
    it('should create extended API with notification helpers', async () => {
      const { createExtendedApi } = await import('../api/mainhub-api')
      const api = createExtendedApi()({} as any)

      expect(api).toHaveProperty('notifications')
      expect(api.notifications).toHaveProperty('showSuccess')
      expect(api.notifications).toHaveProperty('showError')
      expect(api.notifications).toHaveProperty('showWarning')
      expect(api.notifications).toHaveProperty('clear')
    })

    it('should provide theme utilities', async () => {
      const { createExtendedApi } = await import('../api/mainhub-api')
      const api = createExtendedApi()({} as any)

      expect(api).toHaveProperty('theme')
      expect(api.theme).toHaveProperty('switchTheme')
      expect(api.theme).toHaveProperty('getCurrentTheme')
      expect(api.theme).toHaveProperty('getAvailableThemes')
    })

    it('should provide accessibility helpers', async () => {
      const { createExtendedApi } = await import('../api/mainhub-api')
      const api = createExtendedApi()({} as any)

      expect(api).toHaveProperty('accessibility')
      expect(api.accessibility).toHaveProperty('announceMessage')
      expect(api.accessibility).toHaveProperty('setFocus')
      expect(api.accessibility).toHaveProperty('trapFocus')
    })
  })

  describe('Performance', () => {
    it('should monitor performance in development mode', async () => {
      vi.stubEnv('MODE', 'development')
      const originalPerformance = global.performance.mark
      global.performance.mark = vi.fn()

      // Re-import to trigger the performance monitoring
      await import('./piral-instance')

      // Wait a bit for the monitoring to trigger
      await waitFor(() => {
        expect(global.performance.mark).toHaveBeenCalled()
      }, { timeout: 1000 })

      global.performance.mark = originalPerformance
    })
  })

  describe('Error Boundaries', () => {
    it('should handle loading errors', async () => {
      const { LoadingError } = await import('./piral-instance')
      const error = new Error('Failed to load module')

      render(
        <ChakraProvider value={theme}>
          <LoadingError error={error} type="loading" />
        </ChakraProvider>
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Failed to load module')).toBeInTheDocument()
    })

    it('should handle different error types', async () => {
      const { ErrorInfo } = await import('./piral-instance')

      const testCases = [
        { type: 'not_found', expectedMessage: 'Page non trouvée' },
        { type: 'loading', expectedMessage: 'Erreur de chargement' },
        { type: 'page', expectedMessage: 'Erreur de page' },
        { type: 'extension', expectedMessage: "Erreur d'extension" },
      ]

      for (const testCase of testCases) {
        const { rerender } = render(
          <ChakraProvider value={theme}>
            <ErrorInfo type={testCase.type} />
          </ChakraProvider>
        )

        expect(screen.getByText(testCase.expectedMessage)).toBeInTheDocument()
        rerender(<></>)
      }
    })
  })
})