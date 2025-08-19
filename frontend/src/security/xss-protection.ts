import DOMPurify from 'dompurify'

export class XSSProtection {
  private static instance: XSSProtection
  private purifier: typeof DOMPurify
  
  private constructor() {
    this.purifier = DOMPurify
    this.configurePurifier()
  }
  
  private configurePurifier(): void {
    // Configuration stricte de DOMPurify
    this.purifier.setConfig({
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span'],
      ALLOWED_ATTR: ['href', 'title', 'target'],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      SAFE_FOR_TEMPLATES: true,
      WHOLE_DOCUMENT: false,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      FORCE_BODY: true,
      SANITIZE_DOM: true,
      IN_PLACE: false,
      USE_PROFILES: { html: true }
    })
    
    // Hook pour valider les URLs
    this.purifier.addHook('uponSanitizeAttribute', (node, data) => {
      if (data.attrName === 'href' || data.attrName === 'src') {
        const url = data.attrValue
        if (!this.isValidUrl(url)) {
          data.attrValue = ''
        }
      }
    })
  }
  
  static getInstance(): XSSProtection {
    if (!XSSProtection.instance) {
      XSSProtection.instance = new XSSProtection()
    }
    return XSSProtection.instance
  }
  
  // Sanitize HTML content
  sanitizeHtml(dirty: string): string {
    return this.purifier.sanitize(dirty)
  }
  
  // Sanitize pour React dangerouslySetInnerHTML
  sanitizeForReact(dirty: string): { __html: string } {
    return { __html: this.sanitizeHtml(dirty) }
  }
  
  // Validation d'URL
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      // Autoriser uniquement https et mailto
      return ['https:', 'mailto:'].includes(parsed.protocol)
    } catch {
      // URL relative - vérifier les patterns dangereux
      return !url.includes('javascript:') && 
             !url.includes('data:') && 
             !url.includes('vbscript:')
    }
  }
  
  // Escape pour attributs HTML
  escapeHtmlAttribute(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }
}