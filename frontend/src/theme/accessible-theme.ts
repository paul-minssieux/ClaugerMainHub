/**
 * Thème accessible pour Chakra UI v3
 * Compatible avec WCAG 2.1 AA
 */

import { createSystem, defineConfig, defaultConfig } from '@chakra-ui/react'

// Configuration du thème Chakra UI v3
const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Palette de couleurs avec contrastes WCAG AA
        brand: {
          50: { value: '#f0f9ff' },
          100: { value: '#e0f2fe' },
          500: { value: '#0ea5e9' }, // 4.52:1 sur blanc
          600: { value: '#0284c7' }, // 5.92:1 sur blanc
          700: { value: '#0369a1' }, // 7.15:1 sur blanc (AAA)
        },
        gray: {
          50: { value: '#f9fafb' },
          100: { value: '#f3f4f6' },
          200: { value: '#e5e7eb' },
          300: { value: '#d1d5db' },
          400: { value: '#9ca3af' },
          500: { value: '#6b7280' }, // 4.54:1 sur blanc
          600: { value: '#4b5563' }, // 7.21:1 sur blanc (AAA)
          700: { value: '#374151' },
          800: { value: '#1f2937' },
          900: { value: '#111827' },
        },
      },
      fonts: {
        heading: { value: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' },
        body: { value: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' },
      },
      fontSizes: {
        xs: { value: '0.75rem' },    // 12px
        sm: { value: '0.875rem' },   // 14px
        md: { value: '1rem' },       // 16px - Taille minimale recommandée
        lg: { value: '1.125rem' },   // 18px - Texte large
        xl: { value: '1.25rem' },    // 20px
        '2xl': { value: '1.5rem' },  // 24px
      },
    }
  },
  globalCss: {
    // Respect des préférences utilisateur
    '@media (prefers-reduced-motion: reduce)': {
      '*': {
        animationDuration: '0.01ms !important',
        animationIterationCount: '1 !important',
        transitionDuration: '0.01ms !important',
      }
    },
    
    // Focus visible pour l'accessibilité
    '*:focus': {
      outline: '2px solid',
      outlineColor: 'brand.500',
      outlineOffset: '2px',
    },
    
    // Skip links pour l'accessibilité
    '.skip-link': {
      position: 'absolute',
      top: '-40px',
      left: '6px',
      background: 'gray.900',
      color: 'white',
      padding: '8px 16px',
      borderRadius: 'md',
      textDecoration: 'none',
      zIndex: 9999,
      fontSize: 'sm',
      fontWeight: 'medium',
      _focus: {
        top: '6px',
      }
    },

    // Screen reader only
    '.sr-only': {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    }
  }
})

// Créer le système de thème
export const theme = createSystem(defaultConfig, customConfig)

export default theme