/**
 * Gestionnaire du Service Worker
 * UC 1.2 - Intégration et contrôle du Service Worker
 */

import { eventBus } from '@/core/services/event-bus.service'

/**
 * Configuration du Service Worker
 */
interface ServiceWorkerConfig {
  enabled: boolean
  scope: string
  updateInterval: number // Millisecondes
  skipWaiting: boolean
  enableBackgroundSync: boolean
  enablePushNotifications: boolean
}

/**
 * État du Service Worker
 */
export interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isActive: boolean
  isUpdating: boolean
  registration: ServiceWorkerRegistration | null
  error: Error | null
}

/**
 * Gestionnaire du Service Worker
 */
export class ServiceWorkerManager {
  private config: ServiceWorkerConfig
  private state: ServiceWorkerState
  private updateCheckInterval: number | null = null
  private messageHandlers: Map<string, Function> = new Map()

  constructor(config?: Partial<ServiceWorkerConfig>) {
    this.config = {
      enabled: true,
      scope: '/',
      updateInterval: 60 * 60 * 1000, // 1 heure
      skipWaiting: true,
      enableBackgroundSync: true,
      enablePushNotifications: false,
      ...config,
    }

    this.state = {
      isSupported: this.checkSupport(),
      isRegistered: false,
      isActive: false,
      isUpdating: false,
      registration: null,
      error: null,
    }

    // Écouter les messages du SW
    if (this.state.isSupported) {
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this))
    }
  }

  /**
   * Vérifie le support du Service Worker
   */
  private checkSupport(): boolean {
    return 'serviceWorker' in navigator && 
           window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost'
  }

  /**
   * Initialise le Service Worker
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled || !this.state.isSupported) {
      console.log('[ServiceWorkerManager] Service Worker disabled or not supported')
      return
    }

    try {
      console.log('[ServiceWorkerManager] Initializing Service Worker')
      
      // Enregistrer le Service Worker
      const registration = await this.register()
      
      // Configurer les mises à jour
      this.setupUpdateHandling(registration)
      
      // Demander les permissions si nécessaire
      await this.requestPermissions()
      
      // Démarrer la vérification périodique
      this.startUpdateCheck()
      
      // Émettre l'événement de succès
      eventBus.emit('service-worker:initialized', {
        registration,
        state: this.state,
      })
      
    } catch (error) {
      console.error('[ServiceWorkerManager] Initialization failed:', error)
      this.state.error = error as Error
      
      eventBus.emit('service-worker:error', {
        error,
        state: this.state,
      })
      
      throw error
    }
  }

  /**
   * Enregistre le Service Worker
   */
  private async register(): Promise<ServiceWorkerRegistration> {
    console.log('[ServiceWorkerManager] Registering Service Worker')
    
    const registration = await navigator.serviceWorker.register(
      '/service-worker.js',
      { scope: this.config.scope }
    )
    
    this.state.registration = registration
    this.state.isRegistered = true
    
    // Attendre l'activation
    await this.waitForActivation(registration)
    
    console.log('[ServiceWorkerManager] Service Worker registered and active')
    
    return registration
  }

  /**
   * Attend l'activation du Service Worker
   */
  private async waitForActivation(
    registration: ServiceWorkerRegistration
  ): Promise<void> {
    return new Promise((resolve) => {
      if (registration.active) {
        this.state.isActive = true
        resolve()
        return
      }
      
      const checkState = () => {
        if (registration.active) {
          this.state.isActive = true
          resolve()
        }
      }
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              checkState()
            }
          })
        }
      })
      
      // Vérifier immédiatement
      checkState()
    })
  }

  /**
   * Configure la gestion des mises à jour
   */
  private setupUpdateHandling(registration: ServiceWorkerRegistration): void {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      
      if (!newWorker) return
      
      console.log('[ServiceWorkerManager] New Service Worker found')
      this.state.isUpdating = true
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Nouveau SW installé, en attente d'activation
          this.handleUpdateReady(registration)
        } else if (newWorker.state === 'activated') {
          // Nouveau SW activé
          this.state.isUpdating = false
          this.handleUpdateComplete()
        }
      })
    })
  }

  /**
   * Gère une mise à jour prête
   */
  private handleUpdateReady(registration: ServiceWorkerRegistration): void {
    console.log('[ServiceWorkerManager] Update ready')
    
    eventBus.emit('service-worker:update-ready', {
      registration,
      skipWaiting: () => this.skipWaiting(),
    })
    
    // Auto-skip si configuré
    if (this.config.skipWaiting) {
      this.skipWaiting()
    }
  }

  /**
   * Gère une mise à jour complète
   */
  private handleUpdateComplete(): void {
    console.log('[ServiceWorkerManager] Update complete')
    
    eventBus.emit('service-worker:updated', {
      state: this.state,
    })
    
    // Optionnel : recharger la page
    if (this.config.skipWaiting) {
      window.location.reload()
    }
  }

  /**
   * Force l'activation du nouveau Service Worker
   */
  async skipWaiting(): Promise<void> {
    if (!this.state.registration?.waiting) {
      return
    }
    
    // Envoyer le message au SW en attente
    this.state.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    
    // Attendre le contrôleur
    await new Promise<void>((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        resolve()
      }, { once: true })
    })
  }

  /**
   * Démarre la vérification périodique des mises à jour
   */
  private startUpdateCheck(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval)
    }
    
    this.updateCheckInterval = window.setInterval(() => {
      this.checkForUpdates()
    }, this.config.updateInterval)
  }

  /**
   * Vérifie manuellement les mises à jour
   */
  async checkForUpdates(): Promise<void> {
    if (!this.state.registration) {
      return
    }
    
    try {
      console.log('[ServiceWorkerManager] Checking for updates')
      await this.state.registration.update()
    } catch (error) {
      console.error('[ServiceWorkerManager] Update check failed:', error)
    }
  }

  /**
   * Demande les permissions nécessaires
   */
  private async requestPermissions(): Promise<void> {
    const permissions: PermissionName[] = []
    
    if (this.config.enablePushNotifications) {
      permissions.push('notifications' as PermissionName)
    }
    
    for (const permission of permissions) {
      try {
        const result = await navigator.permissions.query({ name: permission })
        
        if (result.state === 'prompt') {
          // Demander la permission si nécessaire
          if (permission === 'notifications') {
            await Notification.requestPermission()
          }
        }
        
        console.log(`[ServiceWorkerManager] Permission ${permission}:`, result.state)
      } catch (error) {
        console.warn(`[ServiceWorkerManager] Failed to request ${permission}:`, error)
      }
    }
  }

  /**
   * Envoie un message au Service Worker
   */
  async sendMessage(message: any): Promise<any> {
    if (!this.state.registration?.active) {
      throw new Error('Service Worker not active')
    }
    
    return new Promise((resolve, reject) => {
      const channel = new MessageChannel()
      
      channel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error))
        } else {
          resolve(event.data)
        }
      }
      
      this.state.registration.active.postMessage(message, [channel.port2])
    })
  }

  /**
   * Gère les messages du Service Worker
   */
  private handleMessage(event: MessageEvent): void {
    const { type, data } = event.data
    
    // Appeler les handlers enregistrés
    const handler = this.messageHandlers.get(type)
    if (handler) {
      handler(data)
    }
    
    // Émettre un événement
    eventBus.emit(`service-worker:message:${type}`, data)
  }

  /**
   * Enregistre un handler de message
   */
  onMessage(type: string, handler: Function): void {
    this.messageHandlers.set(type, handler)
  }

  /**
   * Cache un pilet spécifique
   */
  async cachePilet(pilet: any, content: string): Promise<void> {
    return this.sendMessage({
      type: 'CACHE_PILET',
      data: { pilet, content },
    })
  }

  /**
   * Vide le cache
   */
  async clearCache(cacheName?: string): Promise<void> {
    return this.sendMessage({
      type: 'CLEAR_CACHE',
      data: { cacheName },
    })
  }

  /**
   * Récupère la taille du cache
   */
  async getCacheSize(): Promise<{
    usage: number
    quota: number
    percentage: number
  }> {
    return this.sendMessage({
      type: 'GET_CACHE_SIZE',
    })
  }

  /**
   * Active la synchronisation en arrière-plan
   */
  async enableBackgroundSync(): Promise<void> {
    if (!this.config.enableBackgroundSync) {
      return
    }
    
    if (!this.state.registration) {
      throw new Error('Service Worker not registered')
    }
    
    // Enregistrer la synchronisation
    await (this.state.registration as any).sync.register('sync-pilets')
    
    console.log('[ServiceWorkerManager] Background sync enabled')
  }

  /**
   * Configure les notifications push
   */
  async setupPushNotifications(
    applicationServerKey: string
  ): Promise<PushSubscription | null> {
    if (!this.config.enablePushNotifications) {
      return null
    }
    
    if (!this.state.registration) {
      throw new Error('Service Worker not registered')
    }
    
    // Vérifier la permission
    const permission = await Notification.requestPermission()
    
    if (permission !== 'granted') {
      console.warn('[ServiceWorkerManager] Push notifications denied')
      return null
    }
    
    // S'abonner aux notifications
    const subscription = await this.state.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(applicationServerKey),
    })
    
    console.log('[ServiceWorkerManager] Push subscription created')
    
    return subscription
  }

  /**
   * Convertit une clé base64 en Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')
    
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    
    return outputArray
  }

  /**
   * Désactive le Service Worker
   */
  async unregister(): Promise<void> {
    if (!this.state.registration) {
      return
    }
    
    // Arrêter les vérifications
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval)
      this.updateCheckInterval = null
    }
    
    // Désenregistrer
    const success = await this.state.registration.unregister()
    
    if (success) {
      console.log('[ServiceWorkerManager] Service Worker unregistered')
      
      this.state.isRegistered = false
      this.state.isActive = false
      this.state.registration = null
      
      eventBus.emit('service-worker:unregistered')
    }
  }

  /**
   * Récupère l'état actuel
   */
  getState(): ServiceWorkerState {
    return { ...this.state }
  }

  /**
   * Récupère la configuration
   */
  getConfig(): ServiceWorkerConfig {
    return { ...this.config }
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(config: Partial<ServiceWorkerConfig>): void {
    this.config = { ...this.config, ...config }
    
    // Redémarrer si nécessaire
    if (config.updateInterval !== undefined) {
      this.startUpdateCheck()
    }
  }
}

// Export singleton
export const serviceWorkerManager = new ServiceWorkerManager()

// Auto-initialisation en production
if (import.meta.env.PROD) {
  // Attendre que la page soit chargée
  if (document.readyState === 'complete') {
    serviceWorkerManager.initialize().catch(console.error)
  } else {
    window.addEventListener('load', () => {
      serviceWorkerManager.initialize().catch(console.error)
    })
  }
}