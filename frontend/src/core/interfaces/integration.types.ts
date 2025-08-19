/**
 * Interfaces de base pour les intégrations système
 */

// Configuration Azure Entra ID
export interface AzureAuthConfig {
  clientId: string
  tenantId: string
  redirectUri: string
  postLogoutRedirectUri: string
  scopes: string[]
  cacheLocation: 'localStorage' | 'sessionStorage'
}

// Configuration Application Insights
export interface AppInsightsConfig {
  connectionString: string
  enableAutoRouteTracking: boolean
  enableRequestHeaderTracking: boolean
  enableResponseHeaderTracking: boolean
  disableTelemetry: boolean
  maxBatchInterval: number
  maxBatchSizeInBytes: number
}

// Contract API pour Micro-frontends
export interface MicroFrontendAPI {
  getCurrentUser(): Promise<UserInfo | null>
  getConfiguration(): Promise<AppConfiguration>
  getAuthToken(): Promise<string | null>
  sendNotification(notification: NotificationPayload): void
  updateUrl(url: string, options?: NavigationOptions): void
  subscribe(event: string, handler: EventHandler): () => void
  emit(event: string, data: unknown): void
}

// Types pour l'API
export interface UserInfo {
  id: string
  email: string
  name: string
  role: 'USER' | 'CITIZEN_DEV' | 'ADMIN'
  preferences: UserPreferences
}

export interface UserPreferences {
  language: string
  timezone: string
  theme: 'light' | 'dark' | 'system'
  dateFormat: string
  numberFormat: string
}

export interface AppConfiguration {
  apiBaseUrl: string
  features: Record<string, boolean>
  environment: 'development' | 'staging' | 'production'
  version: string
  buildNumber: string
}

export interface NotificationPayload {
  id?: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: string
  primary?: boolean
}

export interface NavigationOptions {
  replace?: boolean
  state?: unknown
  skipLocationChange?: boolean
}

// Event System
export type EventHandler = (data: unknown) => void

export interface EventBusConfig {
  maxListeners: number
  enableLogging: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

// Micro-frontend Registration
export interface MicroFrontendManifest {
  name: string
  version: string
  url: string
  dependencies?: string[]
  requiredPermissions?: string[]
  exposedAPI?: string[]
  supportedEvents?: string[]
  config?: Record<string, unknown>
}