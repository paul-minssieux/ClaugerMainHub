/**
 * Types TypeScript pour l'orchestrateur Piral
 * UC 1.2 - Configuration de l'orchestrateur micro-frontend
 */

import type { PiletApi, PiletMetadata } from 'piral-core'
import type { EventBusService } from '@/core/services/event-bus.service'
import type { ComponentType, ReactNode } from 'react'

/**
 * Extension de l'API Piral avec les méthodes MainHub
 */
export interface MainHubApi {
  /**
   * Récupère les informations de l'utilisateur courant
   */
  getCurrentUser(): UserInfo

  /**
   * Récupère la configuration de l'application
   */
  getConfiguration(): Configuration

  /**
   * Récupère le token d'authentification
   */
  getAuthToken(): string

  /**
   * Envoie une notification à l'utilisateur
   */
  sendNotification(
    type: 'temporary' | 'persistent',
    message: string,
    duration?: number
  ): void

  /**
   * Met à jour l'URL de navigation
   */
  updateUrl(path: string): void

  /**
   * Demande le mode plein écran
   */
  requestFullscreen(): void

  /**
   * Sort du mode plein écran
   */
  exitFullscreen(): void

  /**
   * Log une erreur dans Application Insights
   */
  logError(error: Error, context?: ErrorContext): void

  /**
   * Enregistre un widget dans le dashboard
   */
  registerWidget(widget: WidgetDefinition): void

  /**
   * S'abonne à un événement du bus
   */
  subscribeToEvent(event: string, handler: EventHandler): () => void

  /**
   * Accès direct à l'EventBus
   */
  eventBus: EventBusService
}

/**
 * Type pour les handlers d'événements
 */
export type EventHandler = (data: unknown) => void

/**
 * API complète exposée aux pilets
 */
export interface ClaugerPiletApi extends PiletApi, MainHubApi {}

/**
 * Informations utilisateur
 */
export interface UserInfo {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  role: UserRole
  permissions: string[]
  avatar?: string
  locale?: string
  theme?: 'light' | 'dark'
}

/**
 * Rôles utilisateur
 */
export type UserRole = 'admin' | 'manager' | 'user' | 'guest'

/**
 * Configuration de l'application
 */
export interface Configuration {
  appVersion: string
  apiBaseUrl: string
  features: FeatureFlags
  environment: 'development' | 'staging' | 'production'
  locale: string
  supportedLocales: string[]
  theme: ThemeConfig
}

/**
 * Feature flags
 */
export interface FeatureFlags {
  [key: string]: boolean
}

/**
 * Configuration du thème
 */
export interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  mode: 'light' | 'dark' | 'auto'
}

/**
 * Définition d'un widget
 */
export interface WidgetDefinition {
  id: string
  name: string
  description?: string
  component: ComponentType<WidgetProps>
  defaultSize: {
    width: number
    height: number
  }
  minSize?: {
    width: number
    height: number
  }
  maxSize?: {
    width: number
    height: number
  }
  configSchema?: ConfigSchema
  category?: string
  icon?: ReactNode
  permissions?: string[]
}

/**
 * Props passées aux composants widget
 */
export interface WidgetProps {
  id: string
  config?: Record<string, unknown>
  onConfigChange?: (config: Record<string, unknown>) => void
  [key: string]: unknown
}

/**
 * Schema de configuration pour les widgets
 */
export interface ConfigSchema {
  type: 'object'
  properties: Record<string, ConfigProperty>
  required?: string[]
}

/**
 * Propriété de configuration
 */
export interface ConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  title?: string
  description?: string
  default?: unknown
  enum?: unknown[]
  items?: ConfigProperty
  properties?: Record<string, ConfigProperty>
}

/**
 * Métadonnées étendues pour les pilets
 */
export interface ClaugerPiletMetadata extends PiletMetadata {
  custom?: {
    requiredRole?: UserRole
    requiredPermissions?: string[]
    preload?: boolean
    category?: string
    icon?: string
    order?: number
    dependencies?: string[]
  }
}

/**
 * Réponse du feed service
 */
export interface PiletFeedResponse {
  items: ClaugerPiletMetadata[]
  timestamp: number
  version: string
}

/**
 * Options de cache pour les pilets
 */
export interface PiletCacheOptions {
  ttl?: number // TTL en millisecondes (optionnel pour compatibilité)
  maxAge: number // TTL en millisecondes
  maxSize: number // Taille max du cache en MB
  strategy: 'cache-first' | 'network-first' | 'cache-only' | 'network-only'
  preloadCritical: boolean
}

/**
 * État du pilet dans le cache
 */
export interface CachedPilet {
  metadata: ClaugerPiletMetadata
  content: string
  timestamp: number
  size: number
  hits: number
}

/**
 * Configuration de l'instance Piral
 */
export interface PiralInstanceConfig {
  feedUrl: string
  debug: boolean
  strictMode: boolean
  async: boolean
  cacheOptions: PiletCacheOptions
  requestOptions: {
    headers?: Record<string, string>
    timeout?: number
    retry?: number
  }
}

/**
 * Événements du cycle de vie des pilets
 */
export interface PiletLifecycleEvents {
  onBeforeLoad?: (pilet: ClaugerPiletMetadata) => void
  onLoaded?: (pilet: ClaugerPiletMetadata) => void
  onError?: (pilet: ClaugerPiletMetadata, error: Error) => void
  onUnmount?: (pilet: ClaugerPiletMetadata) => void
}

/**
 * Contexte de notification
 */
export interface NotificationContext {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  duration?: number
  actions?: NotificationAction[]
  closable?: boolean
}

/**
 * Action de notification
 */
export interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary' | 'danger'
}

/**
 * Options de navigation
 */
export interface NavigationOptions {
  replace?: boolean
  state?: Record<string, unknown>
  preventScrollReset?: boolean
}

/**
 * Contexte d'erreur pour le logging
 */
export interface ErrorContext {
  pilet?: string
  component?: string
  action?: string
  userId?: string
  metadata?: Record<string, unknown>
}

/**
 * État global partagé entre pilets
 */
export interface SharedState {
  user: UserInfo | null
  configuration: Configuration
  theme: ThemeConfig
  locale: string
  notifications: NotificationContext[]
  [key: string]: unknown
}

/**
 * Module déclaration pour l'extension de Piral
 */
declare module 'piral-core/lib/types/custom' {
  interface PiletCustomApi extends MainHubApi {}
}

export type {
  PiletApi,
  PiletMetadata,
}