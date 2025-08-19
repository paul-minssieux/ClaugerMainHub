/**
 * APIs standard pour les pilets
 * UC 1.2 - Extensions d'API pour l'orchestrateur
 */

import type { PiletApi } from 'piral-core'
import { eventBus } from '@/core/services/event-bus.service'

/**
 * Crée l'API de notifications pour les pilets
 */
export function createNotificationApi() {
  return (api: PiletApi) => ({
    ...api,
    showNotification(options: any): string {
      const id = `notification-${Date.now()}-${Math.random()}`
      const notification = {
        id,
        title: options.title,
        message: options.message,
        type: options.type || 'info',
        duration: options.duration || 5000,
        actions: options.actions,
        createdAt: new Date().toISOString(),
      }
      
      // Émettre un événement pour que l'application gère la notification
      eventBus.emit('notification:show', notification)
      
      // Auto-hide après la durée spécifiée
      if (notification.duration > 0) {
        setTimeout(() => {
          eventBus.emit('notification:hide', { id })
        }, notification.duration)
      }
      
      return id
    },
    
    hideNotification(id: string): void {
      eventBus.emit('notification:hide', { id })
    },
    
    clearNotifications(): void {
      eventBus.emit('notifications:clear')
    },
  })
}

/**
 * Crée l'API de dashboard pour les pilets
 */
export function createDashboardApi() {
  return (api: PiletApi) => ({
    ...api,
    registerTile(tile: any): void {
      const widget = {
        id: tile.id || `widget-${Date.now()}`,
        type: tile.type,
        title: tile.title,
        component: tile.component,
        initialColumns: tile.initialColumns || 1,
        initialRows: tile.initialRows || 1,
        resizable: tile.resizable !== false,
        removable: tile.removable !== false,
        data: tile.defaultData,
        permissions: tile.permissions,
        config: tile.config,
      }
      
      eventBus.emit('dashboard:tile-registered', widget)
    },
    
    unregisterTile(id: string): void {
      eventBus.emit('dashboard:tile-unregistered', { id })
    },
    
    updateTile(id: string, updates: any): void {
      eventBus.emit('dashboard:tile-updated', { id, updates })
    },
  })
}

/**
 * Crée l'API de menu pour les pilets
 */
export function createMenuApi() {
  return (api: PiletApi) => ({
    ...api,
    registerMenuItem(item: any): string {
      const menuItem = {
        id: item.id || `menu-${Date.now()}`,
        label: item.label,
        icon: item.icon,
        path: item.path,
        onClick: item.onClick,
        children: item.children,
        permissions: item.permissions,
        position: item.position || 999,
        badge: item.badge,
        isExternal: item.isExternal,
      }
      
      eventBus.emit('menu:item-registered', menuItem)
      
      return menuItem.id
    },
    
    unregisterMenuItem(id: string): void {
      eventBus.emit('menu:item-unregistered', { id })
    },
    
    updateMenuItem(id: string, updates: any): void {
      eventBus.emit('menu:item-updated', { id, updates })
    },
  })
}

/**
 * Crée l'API de modals pour les pilets
 */
export function createModalsApi() {
  return (api: PiletApi) => ({
    ...api,
    showModal(options: any): string {
      const id = options.id || `modal-${Date.now()}`
      const modal = {
        id,
        title: options.title,
        component: options.component,
        size: options.size || 'md',
        closeOnOverlayClick: options.closeOnOverlayClick !== false,
        closeOnEsc: options.closeOnEsc !== false,
        showCloseButton: options.showCloseButton !== false,
        onClose: options.onClose,
        data: options.data,
      }
      
      eventBus.emit('modal:opened', modal)
      
      return id
    },
    
    closeModal(id?: string): void {
      eventBus.emit('modal:closed', { id })
    },
    
    updateModal(id: string, updates: any): void {
      eventBus.emit('modal:updated', { id, updates })
    },
  })
}

/**
 * Crée l'API de formulaires pour les pilets
 */
export function createFormsApi() {
  return (api: PiletApi) => ({
    ...api,
    registerForm(schema: any): void {
      // Enregistrer le schéma de formulaire dans le registre
      const formRegistry = (window as any).__CLAUGER_FORMS__ || {}
      formRegistry[schema.id] = schema
      ;(window as any).__CLAUGER_FORMS__ = formRegistry
      
      eventBus.emit('form:registered', schema)
    },
    
    unregisterForm(id: string): void {
      const formRegistry = (window as any).__CLAUGER_FORMS__ || {}
      delete formRegistry[id]
      
      eventBus.emit('form:unregistered', { id })
    },
    
    validateForm(id: string, data: any): Promise<any> {
      const formRegistry = (window as any).__CLAUGER_FORMS__ || {}
      const schema = formRegistry[id]
      
      if (!schema) {
        return Promise.reject(new Error(`Form schema ${id} not found`))
      }
      
      // Validation avec le schéma
      return schema.validate ? schema.validate(data) : Promise.resolve(data)
    },
    
    submitForm(id: string, data: any): Promise<any> {
      eventBus.emit('form:submitted', { id, data })
      
      // Déléguer la soumission au handler enregistré
      const formRegistry = (window as any).__CLAUGER_FORMS__ || {}
      const schema = formRegistry[id]
      
      if (schema?.onSubmit) {
        return schema.onSubmit(data)
      }
      
      return Promise.resolve(data)
    },
  })
}

/**
 * Crée toutes les APIs standard pour les pilets
 */
export function createStandardApi() {
  return [
    createNotificationApi(),
    createDashboardApi(),
    createMenuApi(),
    createModalsApi(),
    createFormsApi(),
    // API utilitaires supplémentaires
    (api: PiletApi) => ({
      ...api,
      
      emit(event: string, data?: any): void {
        eventBus.emit(event, data)
      },
      
      on(event: string, handler: Function): () => void {
        const unsubscribe = eventBus.on(event, handler)
        return unsubscribe
      },
      
      // API de navigation
      navigateTo(path: string, options?: any): void {
        window.history.pushState(options?.state, '', path)
        eventBus.emit('navigation:changed', { path, options })
      },
      
      // API de traduction
      translate(key: string, params?: any): string {
        // Utiliser le service i18n global si disponible
        return (window as any).i18n?.t(key, params) || key
      },
    }),
  ]
}