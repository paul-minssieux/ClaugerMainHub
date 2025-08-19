/**
 * Tests unitaires pour l'API MainHub
 * UC 1.2 - Configuration de l'orchestrateur micro-frontend
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMainHubApi, createExtendedApi } from './mainhub-api'
import { eventBus } from '@/core/services/event-bus.service'

// Mock EventBus
vi.mock('@/core/services/event-bus.service', () => ({
  eventBus: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
  },
}))

// Mock shared state
const mockSharedState = {
  currentUser: null,
  configuration: null,
  widgets: new Map(),
  permissions: new Set(['USER']),
}

// Mock Piral context
const createMockContext = () => ({
  showNotification: vi.fn(),
  closeNotification: vi.fn(),
  registerTile: vi.fn(),
  registerModal: vi.fn(),
  registerMenu: vi.fn(),
})

describe('MainHub API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSharedState.currentUser = null
    mockSharedState.configuration = null
    mockSharedState.widgets.clear()
    mockSharedState.permissions.clear()
    mockSharedState.permissions.add('USER')
  })

  describe('createMainHubApi', () => {
    it('should create API with all required methods', () => {
      const context = createMockContext()
      const api = createMainHubApi()(context as any)

      expect(api).toHaveProperty('getCurrentUser')
      expect(api).toHaveProperty('getConfiguration')
      expect(api).toHaveProperty('sendNotification')
      expect(api).toHaveProperty('registerWidget')
      expect(api).toHaveProperty('subscribeToEvent')
      expect(api).toHaveProperty('logError')
      expect(api).toHaveProperty('eventBus')
    })

    describe('getCurrentUser', () => {
      it('should return current user information', async () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        const user = await api.getCurrentUser()

        expect(user).toMatchObject({
          id: expect.any(String),
          email: expect.any(String),
          name: expect.any(String),
          roles: expect.any(Array),
          permissions: expect.any(Array),
        })
      })

      it('should cache user information', async () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        const user1 = await api.getCurrentUser()
        const user2 = await api.getCurrentUser()

        expect(user1).toBe(user2) // Same reference
      })

      it('should return user with correct structure', async () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        const user = await api.getCurrentUser()

        expect(user).toHaveProperty('id')
        expect(user).toHaveProperty('email')
        expect(user).toHaveProperty('name')
        expect(user).toHaveProperty('roles')
        expect(user).toHaveProperty('permissions')
        expect(user).toHaveProperty('preferences')
        expect(user.preferences).toHaveProperty('language')
        expect(user.preferences).toHaveProperty('timezone')
        expect(user.preferences).toHaveProperty('theme')
      })
    })

    describe('getConfiguration', () => {
      it('should return application configuration', async () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        const config = await api.getConfiguration()

        expect(config).toMatchObject({
          apiBaseUrl: expect.any(String),
          features: expect.any(Object),
          environment: expect.any(String),
          version: expect.any(String),
        })
      })

      it('should cache configuration', async () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        const config1 = await api.getConfiguration()
        const config2 = await api.getConfiguration()

        expect(config1).toBe(config2) // Same reference
      })

      it('should return configuration with feature flags', async () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        const config = await api.getConfiguration()

        expect(config.features).toHaveProperty('dashboard')
        expect(config.features).toHaveProperty('notifications')
        expect(config.features).toHaveProperty('search')
        expect(config.features).toHaveProperty('widgets')
        expect(config.features).toHaveProperty('analytics')
      })
    })

    describe('sendNotification', () => {
      it('should send info notification', () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        api.sendNotification('info', 'Test message')

        expect(context.showNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'info',
            content: 'Test message',
          })
        )
      })

      it('should send success notification', () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        api.sendNotification('success', 'Success message', 3000)

        expect(context.showNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'success',
            content: 'Success message',
            options: expect.objectContaining({
              autoClose: 3000,
            }),
          })
        )
      })

      it('should send error notification', () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        api.sendNotification('error', 'Error message')

        expect(context.showNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            content: 'Error message',
            options: expect.objectContaining({
              autoClose: 10000, // Longer duration for errors
            }),
          })
        )
      })

      it('should emit event for notifications', () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        api.sendNotification('warning', 'Warning message')

        expect(eventBus.emit).toHaveBeenCalledWith(
          'notification:sent',
          expect.objectContaining({
            type: 'warning',
            message: 'Warning message',
          })
        )
      })
    })

    describe('registerWidget', () => {
      it('should register widget with required properties', () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        const widget = {
          id: 'test-widget',
          name: 'Test Widget',
          component: () => null,
          defaultSize: { width: 2, height: 2 },
          permissions: ['USER'],
        }

        api.registerWidget(widget)

        expect(eventBus.emit).toHaveBeenCalledWith('widget:registered', widget)
      })

      it('should check permissions before registering', () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        const widget = {
          id: 'admin-widget',
          name: 'Admin Widget',
          component: () => null,
          defaultSize: { width: 2, height: 2 },
          permissions: ['ADMIN'],
        }

        api.registerWidget(widget)

        // Should not register if user doesn't have permission
        expect(eventBus.emit).not.toHaveBeenCalledWith('widget:registered', widget)
      })

      it('should register widget with Piral dashboard API', () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        const widget = {
          id: 'dashboard-widget',
          name: 'Dashboard Widget',
          component: () => null,
          defaultSize: { width: 3, height: 2 },
          permissions: ['USER'],
        }

        api.registerWidget(widget)

        expect(context.registerTile).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'dashboard-widget',
            preferences: expect.objectContaining({
              initialColumns: 3,
              initialRows: 2,
            }),
          })
        )
      })
    })

    describe('subscribeToEvent', () => {
      it('should subscribe to events', () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)
        const handler = vi.fn()

        api.subscribeToEvent('test:event', handler)

        expect(eventBus.on).toHaveBeenCalledWith('test:event', expect.any(Function))
      })

      it('should return unsubscribe function', () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)
        const handler = vi.fn()

        const unsubscribe = api.subscribeToEvent('test:event', handler)

        expect(unsubscribe).toBeInstanceOf(Function)
        
        unsubscribe()
        
        expect(eventBus.off).toHaveBeenCalledWith('test:event', expect.any(Function))
      })

      it('should wrap handler to match EventBus signature', () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)
        const handler = vi.fn()

        api.subscribeToEvent('test:event', handler)

        const registeredHandler = (eventBus.on as any).mock.calls[0][1]
        registeredHandler('test data')

        expect(handler).toHaveBeenCalledWith('test data')
      })
    })

    describe('logError', () => {
      it('should log errors with context', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation()
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        const error = new Error('Test error')
        api.logError(error, { component: 'TestComponent' })

        expect(consoleSpy).toHaveBeenCalledWith(
          '[MainHub Error]',
          error,
          expect.objectContaining({ component: 'TestComponent' })
        )

        consoleSpy.mockRestore()
      })

      it('should emit error event', () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        const error = new Error('Test error')
        api.logError(error)

        expect(eventBus.emit).toHaveBeenCalledWith(
          'error:logged',
          expect.objectContaining({
            error,
            timestamp: expect.any(Date),
          })
        )
      })
    })

    describe('eventBus', () => {
      it('should provide direct access to EventBus', () => {
        const context = createMockContext()
        const api = createMainHubApi()(context as any)

        expect(api.eventBus).toBe(eventBus)
      })
    })
  })

  describe('createExtendedApi', () => {
    it('should create extended API with notification helpers', () => {
      const context = createMockContext()
      const api = createExtendedApi()(context as any)

      expect(api).toHaveProperty('notifications')
      expect(api.notifications).toHaveProperty('showSuccess')
      expect(api.notifications).toHaveProperty('showError')
      expect(api.notifications).toHaveProperty('showWarning')
      expect(api.notifications).toHaveProperty('showWithAction')
      expect(api.notifications).toHaveProperty('clear')
    })

    describe('notifications', () => {
      it('should show success notification', () => {
        const context = createMockContext()
        const api = createExtendedApi()(context as any)

        api.notifications.showSuccess('Success!', 'Operation completed')

        expect(eventBus.emit).toHaveBeenCalledWith(
          'notification:show',
          expect.objectContaining({
            type: 'success',
            message: 'Success!',
            title: 'Operation completed',
            duration: 5000,
          })
        )
      })

      it('should show error notification with longer duration', () => {
        const context = createMockContext()
        const api = createExtendedApi()(context as any)

        api.notifications.showError('Error occurred')

        expect(eventBus.emit).toHaveBeenCalledWith(
          'notification:show',
          expect.objectContaining({
            type: 'error',
            message: 'Error occurred',
            duration: 10000, // Longer for errors
          })
        )
      })

      it('should show warning notification', () => {
        const context = createMockContext()
        const api = createExtendedApi()(context as any)

        api.notifications.showWarning('Warning message')

        expect(eventBus.emit).toHaveBeenCalledWith(
          'notification:show',
          expect.objectContaining({
            type: 'warning',
            message: 'Warning message',
            duration: 7000,
          })
        )
      })

      it('should clear notifications', () => {
        const context = createMockContext()
        const api = createExtendedApi()(context as any)

        api.notifications.clear('notification-123')

        expect(eventBus.emit).toHaveBeenCalledWith(
          'notification:clear',
          { id: 'notification-123' }
        )
      })

      it('should clear all notifications when no ID provided', () => {
        const context = createMockContext()
        const api = createExtendedApi()(context as any)

        api.notifications.clear()

        expect(eventBus.emit).toHaveBeenCalledWith(
          'notification:clear',
          { id: undefined }
        )
      })
    })

    describe('theme', () => {
      it('should provide theme utilities', () => {
        const context = createMockContext()
        const api = createExtendedApi()(context as any)

        expect(api.theme).toHaveProperty('switchTheme')
        expect(api.theme).toHaveProperty('getCurrentTheme')
        expect(api.theme).toHaveProperty('getAvailableThemes')
        expect(api.theme).toHaveProperty('applyColorScheme')
      })

      it('should switch theme', () => {
        const context = createMockContext()
        const api = createExtendedApi()(context as any)

        api.theme.switchTheme('dark')

        expect(eventBus.emit).toHaveBeenCalledWith(
          'theme:changed',
          { theme: 'dark' }
        )
      })

      it('should get current theme', () => {
        const context = createMockContext()
        const api = createExtendedApi()(context as any)

        const theme = api.theme.getCurrentTheme()

        expect(theme).toBe('light')
      })

      it('should get available themes', () => {
        const context = createMockContext()
        const api = createExtendedApi()(context as any)

        const themes = api.theme.getAvailableThemes()

        expect(themes).toEqual(['light', 'dark', 'auto'])
      })
    })

    describe('accessibility', () => {
      it('should provide accessibility helpers', () => {
        const context = createMockContext()
        const api = createExtendedApi()(context as any)

        expect(api.accessibility).toHaveProperty('announceMessage')
        expect(api.accessibility).toHaveProperty('setFocus')
        expect(api.accessibility).toHaveProperty('trapFocus')
      })

      it('should announce messages to screen readers', () => {
        const context = createMockContext()
        const api = createExtendedApi()(context as any)

        // Create announcer element
        const announcer = document.createElement('div')
        announcer.id = 'sr-announcer'
        announcer.setAttribute('aria-live', 'polite')
        document.body.appendChild(announcer)

        api.accessibility.announceMessage('Important update', 'assertive')

        expect(announcer.textContent).toBe('Important update')

        document.body.removeChild(announcer)
      })

      it('should set focus on element', () => {
        const context = createMockContext()
        const api = createExtendedApi()(context as any)

        const button = document.createElement('button')
        button.id = 'test-button'
        document.body.appendChild(button)

        const focusSpy = vi.spyOn(button, 'focus')

        api.accessibility.setFocus('#test-button')

        expect(focusSpy).toHaveBeenCalled()

        document.body.removeChild(button)
      })

      it('should return cleanup function for trap focus', () => {
        const context = createMockContext()
        const api = createExtendedApi()(context as any)

        const cleanup = api.accessibility.trapFocus('.modal-container')

        expect(cleanup).toBeInstanceOf(Function)
      })
    })
  })
})