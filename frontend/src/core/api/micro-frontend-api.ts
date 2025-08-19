/**
 * API exposée aux micro-frontends
 */

import { 
  MicroFrontendAPI, 
  UserInfo, 
  AppConfiguration,
  NotificationPayload,
  NavigationOptions 
} from '@/core/interfaces/integration.types'
import { eventBus } from '@/core/services/event-bus.service'

class MicroFrontendAPIProvider implements MicroFrontendAPI {
  private userCache: UserInfo | null = null
  private tokenCache: string | null = null
  private configCache: AppConfiguration | null = null

  async getCurrentUser(): Promise<UserInfo | null> {
    // TODO: Implement when auth service is ready
    if (!this.userCache) {
      // Placeholder - will be replaced with actual auth service call
      this.userCache = {
        id: 'placeholder',
        email: 'user@clauger.com',
        name: 'User',
        role: 'USER',
        preferences: {
          language: 'fr',
          timezone: 'Europe/Paris',
          theme: 'light',
          dateFormat: 'DD/MM/YYYY',
          numberFormat: 'fr-FR',
        },
      }
    }
    return this.userCache
  }

  async getConfiguration(): Promise<AppConfiguration> {
    if (!this.configCache) {
      this.configCache = {
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
        features: {
          dashboard: true,
          notifications: true,
          search: true,
        },
        environment: import.meta.env.MODE as 'development' | 'staging' | 'production',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        buildNumber: import.meta.env.VITE_BUILD_NUMBER || 'dev',
      }
    }
    return this.configCache
  }

  async getAuthToken(): Promise<string | null> {
    // TODO: Implement when auth service is ready
    if (!this.tokenCache) {
      // Placeholder token
      this.tokenCache = 'placeholder-token'
    }
    return this.tokenCache
  }

  sendNotification(notification: NotificationPayload): void {
    eventBus.emit('notification:show', notification)
  }

  updateUrl(url: string, options?: NavigationOptions): void {
    eventBus.emit('navigation:change', { url, options })
    
    if (!options?.skipLocationChange) {
      if (options?.replace) {
        window.history.replaceState(options.state || null, '', url)
      } else {
        window.history.pushState(options.state || null, '', url)
      }
    }
  }

  subscribe(event: string, handler: (data: unknown) => void): () => void {
    return eventBus.subscribe(event, handler)
  }

  emit(event: string, data: unknown): void {
    eventBus.emit(event, data)
  }

  // Helper methods for internal use
  clearCache(): void {
    this.userCache = null
    this.tokenCache = null
    this.configCache = null
  }

  updateUserCache(user: UserInfo | null): void {
    this.userCache = user
    eventBus.emit('user:changed', user)
  }

  updateTokenCache(token: string | null): void {
    this.tokenCache = token
    eventBus.emit('token:refreshed', { hasToken: !!token })
  }
}

// Export singleton instance
export const microFrontendAPI = new MicroFrontendAPIProvider()

// Expose globally for micro-frontends
if (typeof window !== 'undefined') {
  ;(window as any).ClaugerMainHub = microFrontendAPI
}