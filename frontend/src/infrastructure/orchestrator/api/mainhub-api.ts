/**
 * API MainHub étendue pour les pilets
 * UC 1.2 - Configuration de l'orchestrateur micro-frontend
 */

import type { PiletApi } from 'piral-core'
import type {
  MainHubApi,
  UserInfo,
  Configuration,
  WidgetDefinition,
  NotificationContext,
  ErrorContext,
  UserRole,
} from '../instance/piral-types'
import { EventBusService } from '@/core/services/event-bus.service'

// Instance singleton de l'EventBus
const eventBus = EventBusService.getInstance()

// État global partagé (sera remplacé par Redux dans les UC suivants)
const sharedState = {
  user: null as UserInfo | null,
  configuration: null as Configuration | null,
  widgets: new Map<string, WidgetDefinition>(),
  notifications: [] as NotificationContext[],
}

/**
 * Crée l'API MainHub étendue pour les pilets
 */
export function createMainHubApi() {
  return (context: PiletApi): MainHubApi => ({
    /**
     * Récupère les informations de l'utilisateur courant
     */
    getCurrentUser(): UserInfo {
      // TODO: À implémenter avec MSAL dans UC 2.x
      // Mock pour le développement
      if (!sharedState.user) {
        sharedState.user = {
          id: 'user-123',
          email: 'user@clauger.com',
          name: 'Jean Dupont',
          firstName: 'Jean',
          lastName: 'Dupont',
          role: 'user' as UserRole,
          permissions: ['read', 'write'],
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JeanDupont',
          locale: 'fr-FR',
          theme: 'light',
        }
      }
      return sharedState.user
    },

    /**
     * Récupère la configuration de l'application
     */
    getConfiguration(): Configuration {
      if (!sharedState.configuration) {
        sharedState.configuration = {
          appVersion: '1.0.0',
          apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
          features: {
            enableDarkMode: true,
            enableNotifications: true,
            enableWidgets: true,
            enableOfflineMode: false,
          },
          environment: import.meta.env.MODE as 'development' | 'staging' | 'production',
          locale: 'fr-FR',
          supportedLocales: ['fr-FR', 'en-US', 'es-ES', 'it-IT'],
          theme: {
            primaryColor: '#2D3748',
            secondaryColor: '#4A5568',
            mode: 'light',
          },
        }
      }
      return sharedState.configuration
    },

    /**
     * Récupère le token d'authentification
     */
    getAuthToken(): string {
      // TODO: À implémenter avec MSAL dans UC 2.x
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
      if (!token && import.meta.env.MODE === 'development') {
        // Token mock pour le développement
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token'
      }
      return token || ''
    },

    /**
     * Envoie une notification à l'utilisateur
     */
    sendNotification(
      type: 'temporary' | 'persistent',
      message: string,
      duration?: number
    ): void {
      const notification: NotificationContext = {
        id: `notif-${Date.now()}`,
        type: 'info',
        message,
        closable: true,
        ...(type === 'temporary' && { duration: duration || 5000 })
      }

      if (type === 'temporary') {
        // Utiliser l'API de notifications Piral
        context.showNotification(message, {
          autoClose: duration || 5000,
        })
      } else {
        // Ajouter à la liste des notifications persistantes
        sharedState.notifications.push(notification)
        eventBus.emit('notification:added', notification)
      }

      // Log pour le monitoring
      console.log('[MainHub] Notification sent:', { type, message })
    },

    /**
     * Met à jour l'URL de navigation
     */
    updateUrl(path: string): void {
      // Utiliser l'API de navigation Piral si disponible
      if ('navigation' in context && context.navigation) {
        (context as any).navigation.push(path)
      } else {
        // Fallback sur l'API History
        window.history.pushState({}, '', path)
      }
      
      // Émettre un événement de navigation
      eventBus.emit('navigation:changed', { path })
    },

    /**
     * Demande le mode plein écran
     */
    requestFullscreen(): void {
      const elem = document.documentElement
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
          console.error('[MainHub] Failed to enter fullscreen:', err)
        })
      }
    },

    /**
     * Sort du mode plein écran
     */
    exitFullscreen(): void {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error('[MainHub] Failed to exit fullscreen:', err)
        })
      }
    },

    /**
     * Log une erreur dans Application Insights
     */
    logError(error: Error, context?: ErrorContext): void {
      // TODO: Intégrer Application Insights dans UC 1.10
      console.error('[MainHub] Error logged:', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        context,
        timestamp: new Date().toISOString(),
        pilet: context?.pilet || 'unknown',
      })

      // Émettre un événement d'erreur
      eventBus.emit('error:logged', { error, context })

      // En développement, afficher dans la console
      if (import.meta.env.MODE === 'development') {
        console.error('Full error details:', error)
      }
    },

    /**
     * Enregistre un widget dans le dashboard
     */
    registerWidget(widget: WidgetDefinition): void {
      // Valider le widget
      if (!widget.id || !widget.name || !widget.component) {
        throw new Error('Invalid widget definition: id, name and component are required')
      }

      // Vérifier les permissions
      const user = this.getCurrentUser()
      if (widget.permissions && widget.permissions.length > 0) {
        const hasPermission = widget.permissions.some(perm => 
          user.permissions.includes(perm)
        )
        if (!hasPermission) {
          console.warn(`[MainHub] User lacks permission to register widget: ${widget.id}`)
          return
        }
      }

      // Enregistrer le widget
      sharedState.widgets.set(widget.id, widget)
      
      // Utiliser l'API dashboard de Piral si disponible
      if ('registerTile' in context && typeof context.registerTile === 'function') {
        (context as any).registerTile({
          id: widget.id,
          component: widget.component,
          preferences: {
            initialColumns: widget.defaultSize.width,
            initialRows: widget.defaultSize.height,
          },
        })
      }

      // Émettre un événement
      eventBus.emit('widget:registered', widget)
      
      console.log(`[MainHub] Widget registered: ${widget.id}`)
    },

    /**
     * S'abonne à un événement du bus
     */
    subscribeToEvent(event: string, handler: Function): () => void {
      // S'abonner via l'EventBus
      const eventHandler = (data: unknown) => handler(data)
      eventBus.on(event, eventHandler)
      
      // Retourner une fonction de désabonnement
      return () => {
        eventBus.off(event, eventHandler)
      }
    },

    /**
     * Accès direct à l'EventBus
     */
    eventBus,
  })
}

/**
 * Extensions supplémentaires de l'API
 */
export function createExtendedApi() {
  return (_context: any) => ({
    /**
     * API pour les notifications avancées
     */
    notifications: {
      showSuccess(message: string, title?: string): void {
        const notification: NotificationContext = {
          id: `success-${Date.now()}`,
          type: 'success',
          message,
          duration: 5000,
          closable: true,
          ...(title && { title })
        }
        eventBus.emit('notification:show', notification)
      },
      
      showError(message: string, title?: string): void {
        const notification: NotificationContext = {
          id: `error-${Date.now()}`,
          type: 'error',
          message,
          duration: 10000,
          closable: true,
          ...(title && { title })
        }
        eventBus.emit('notification:show', notification)
      },
      
      showWarning(message: string, title?: string): void {
        const notification: NotificationContext = {
          id: `warning-${Date.now()}`,
          type: 'warning',
          message,
          duration: 7000,
          closable: true,
          ...(title && { title })
        }
        eventBus.emit('notification:show', notification)
      },
      
      showWithAction(notification: NotificationContext): void {
        eventBus.emit('notification:show', notification)
      },
      
      clear(id?: string): void {
        if (id) {
          eventBus.emit('notification:clear', { id })
        } else {
          eventBus.emit('notification:clear-all', {})
        }
      },
    },

    /**
     * API pour les thèmes et personnalisation
     */
    theme: {
      setMode(mode: 'light' | 'dark' | 'auto'): void {
        localStorage.setItem('theme-mode', mode)
        eventBus.emit('theme:changed', { mode })
      },
      
      getMode(): 'light' | 'dark' | 'auto' {
        return (localStorage.getItem('theme-mode') as any) || 'light'
      },
      
      setPrimaryColor(color: string): void {
        document.documentElement.style.setProperty('--primary-color', color)
        eventBus.emit('theme:color-changed', { primary: color })
      },
    },

    /**
     * API pour l'analytics
     */
    analytics: {
      trackEvent(event: string, properties?: Record<string, any>): void {
        // TODO: Intégrer Application Insights dans UC 1.10
        console.log('[Analytics] Event tracked:', { event, properties })
        eventBus.emit('analytics:event', { event, properties })
      },
      
      trackPageView(page: string, properties?: Record<string, any>): void {
        console.log('[Analytics] Page view:', { page, properties })
        eventBus.emit('analytics:pageview', { page, properties })
      },
      
      setUserProperties(properties: Record<string, any>): void {
        console.log('[Analytics] User properties:', properties)
        eventBus.emit('analytics:user', { properties })
      },
    },

    /**
     * API pour l'accessibilité
     */
    accessibility: {
      announce(message: string, priority?: 'polite' | 'assertive'): void {
        const announcer = document.getElementById(
          priority === 'assertive' ? 'assertive-announcer' : 'live-announcer'
        )
        if (announcer) {
          announcer.textContent = message
        }
      },
      
      setFocus(selector: string): void {
        const element = document.querySelector(selector) as HTMLElement
        if (element) {
          element.focus()
        }
      },
      
      trapFocus(_container: string): () => void {
        // TODO: Implémenter le focus trap
        return () => {}
      },
    },
  })
}