/**
 * Event Bus pour communication inter-modules
 */

import { EventBusConfig, EventHandler } from '@/core/interfaces/integration.types'

export class EventBusService {
  private events: Map<string, Set<EventHandler>> = new Map()
  private eventHistory: Map<string, unknown[]> = new Map()
  private config: EventBusConfig
  private static instance: EventBusService | null = null

  constructor(config: EventBusConfig) {
    this.config = config
  }

  static getInstance(): EventBusService {
    if (!EventBusService.instance) {
      EventBusService.instance = new EventBusService(eventBusConfig)
    }
    return EventBusService.instance
  }

  /**
   * Subscribe to an event
   */
  subscribe(event: string, handler: EventHandler): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }

    const handlers = this.events.get(event)!
    
    if (handlers.size >= this.config.maxListeners) {
      console.warn(`Max listeners (${this.config.maxListeners}) reached for event: ${event}`)
    }

    handlers.add(handler)
    this.log('debug', `Subscribed to event: ${event}`)

    // Return unsubscribe function
    return () => {
      handlers.delete(handler)
      this.log('debug', `Unsubscribed from event: ${event}`)
    }
  }

  /**
   * Emit an event
   */
  emit(event: string, data?: unknown): void {
    const handlers = this.events.get(event)
    
    if (!handlers || handlers.size === 0) {
      this.log('debug', `No handlers for event: ${event}`)
      return
    }

    // Store in history
    this.addToHistory(event, data)

    // Execute handlers
    handlers.forEach(handler => {
      try {
        handler(data)
      } catch (error) {
        this.log('error', `Error in event handler for ${event}:`, error)
      }
    })

    this.log('debug', `Emitted event: ${event}`, data)
  }

  /**
   * Get event history
   */
  getHistory(event: string): unknown[] {
    return this.eventHistory.get(event) || []
  }

  /**
   * Clear all listeners for an event
   */
  clear(event?: string): void {
    if (event) {
      this.events.delete(event)
      this.eventHistory.delete(event)
    } else {
      this.events.clear()
      this.eventHistory.clear()
    }
  }

  /**
   * Alias for subscribe (for compatibility)
   */
  on(event: string, handler: EventHandler): void {
    this.subscribe(event, handler)
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  private addToHistory(event: string, data: unknown): void {
    if (!this.eventHistory.has(event)) {
      this.eventHistory.set(event, [])
    }
    
    const history = this.eventHistory.get(event)!
    history.push({ timestamp: Date.now(), data })
    
    // Keep only last 100 events
    if (history.length > 100) {
      history.shift()
    }
  }

  private log(level: string, message: string, data?: unknown): void {
    if (!this.config.enableLogging) return
    
    const logLevels = ['debug', 'info', 'warn', 'error']
    const configLevel = logLevels.indexOf(this.config.logLevel)
    const messageLevel = logLevels.indexOf(level)
    
    if (messageLevel >= configLevel) {
      const logMethod = (console[level as keyof Console] as any) || console.log
      if (typeof logMethod === 'function') {
        if (data !== undefined) {
          logMethod(`[EventBus] ${message}`, data)
        } else {
          logMethod(`[EventBus] ${message}`)
        }
      }
    }
  }
}

// Configuration par défaut
const eventBusConfig: EventBusConfig = {
  maxListeners: 100,
  enableLogging: import.meta.env.DEV,
  logLevel: import.meta.env.DEV ? 'debug' : 'error',
}

// Export singleton instance
export const eventBus = new EventBusService(eventBusConfig)

// Export alias pour compatibilité
export const EventBus = EventBusService