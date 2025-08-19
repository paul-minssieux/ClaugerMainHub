export interface CSPConfig {
  nonce: string
  reportUri?: string
  mode: 'development' | 'production'
}

export class ContentSecurityPolicy {
  private directives: Map<string, string[]>
  
  constructor(private config: CSPConfig) {
    this.directives = new Map()
    this.initializeDefaultPolicy()
  }
  
  private initializeDefaultPolicy(): void {
    const { mode, nonce } = this.config
    
    // Politique de base stricte
    this.directives.set('default-src', ["'self'"])
    
    // Scripts avec nonce pour inline scripts sécurisés
    this.directives.set('script-src', [
      "'self'",
      `'nonce-${nonce}'`,
      mode === 'development' ? "'unsafe-eval'" : '', // Uniquement pour HMR en dev
      'https://login.microsoftonline.com' // Azure AD
    ].filter(Boolean))
    
    // Styles
    this.directives.set('style-src', [
      "'self'",
      `'nonce-${nonce}'`,
      "'unsafe-inline'", // Required for Chakra UI
      'https://fonts.googleapis.com'
    ])
    
    // Images
    this.directives.set('img-src', [
      "'self'",
      'data:',
      'https:',
      'blob:'
    ])
    
    // Connexions API
    this.directives.set('connect-src', [
      "'self'",
      'https://login.microsoftonline.com',
      'https://graph.microsoft.com',
      'wss://localhost:3000', // WebSocket pour HMR en dev
      mode === 'production' ? 'https://api.clauger.fr' : 'https://localhost:5000'
    ].filter(Boolean))
    
    // Fonts
    this.directives.set('font-src', [
      "'self'",
      'https://fonts.gstatic.com'
    ])
    
    // Frames - Aucune iframe autorisée
    this.directives.set('frame-src', ["'none'"])
    this.directives.set('frame-ancestors', ["'none'"])
    
    // Autres restrictions
    this.directives.set('object-src', ["'none'"])
    this.directives.set('base-uri', ["'self'"])
    this.directives.set('form-action', ["'self'"])
    
    // Upgrade HTTP vers HTTPS
    if (mode === 'production') {
      this.directives.set('upgrade-insecure-requests', [''])
    }
    
    // Reporting
    if (this.config.reportUri) {
      this.directives.set('report-uri', [this.config.reportUri])
    }
  }
  
  getHeaderValue(): string {
    const policies = Array.from(this.directives.entries())
      .map(([key, values]) => {
        const valueString = values.filter(v => v).join(' ')
        return valueString ? `${key} ${valueString}` : key
      })
      .join('; ')
    
    return policies
  }
  
  // Génération de nonce cryptographiquement sûr
  static generateNonce(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }
}