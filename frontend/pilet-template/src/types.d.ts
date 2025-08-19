/**
 * Types pour le template pilet
 */

import type { PiletApi as BasePiletApi } from 'piral-core'
import type { MainHubApi } from '@clauger/mainhub-api'

/**
 * API complète disponible pour les pilets
 */
export interface PiletApi extends BasePiletApi, MainHubApi {
  // L'API combine Piral et MainHub
}

/**
 * Props communes pour les composants du pilet
 */
export interface PiletComponentProps {
  api: PiletApi
  piral: PiletApi
}

/**
 * Types pour les données du pilet
 */
export interface TemplateData {
  id: string
  name: string
  description?: string
  metadata?: Record<string, any>
}

/**
 * Configuration du pilet
 */
export interface PiletConfig {
  apiUrl?: string
  features?: {
    enableWidget?: boolean
    enableMenu?: boolean
    enableExtensions?: boolean
  }
  permissions?: string[]
}

// Déclaration des modules pour les assets
declare module '*.css' {
  const content: string
  export default content
}

declare module '*.scss' {
  const content: string
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}