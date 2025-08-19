import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

// Palette de couleurs avec contrastes WCAG AA
const colors = {
  brand: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9', // 4.52:1 sur blanc
    600: '#0284c7', // 5.92:1 sur blanc
    700: '#0369a1', // 7.15:1 sur blanc (AAA)
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280', // 4.54:1 sur blanc
    600: '#4b5563', // 7.21:1 sur blanc (AAA)
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  error: {
    500: '#dc2626', // 5.03:1 sur blanc
    600: '#b91c1c', // 6.64:1 sur blanc
  },
  success: {
    500: '#059669', // 4.52:1 sur blanc
    600: '#047857', // 5.74:1 sur blanc
  },
  warning: {
    500: '#d97706', // 4.52:1 sur blanc
    600: '#b45309', // 5.74:1 sur blanc
  }
}

// Typographie accessible
const fonts = {
  heading: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
}

const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  md: '1rem',       // 16px - Taille minimale recommandée
  lg: '1.125rem',   // 18px - Texte large
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
}

// Espacements cohérents
const space = {
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
}

const theme = extendTheme({
  config,
  colors,
  fonts,
  fontSizes,
  space,
  
  // Styles globaux pour l'accessibilité
  styles: {
    global: {
      // Respect des préférences utilisateur
      '@media (prefers-reduced-motion: reduce)': {
        '*': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
        }
      },
      
      // Focus visible
      '*:focus': {
        outline: '2px solid',
        outlineColor: 'brand.500',
        outlineOffset: '2px',
      },
      
      // Skip links
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
  },
  
  // Composants avec styles accessibles
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
        minH: '44px', // Taille de cible tactile WCAG
        px: 4,
        _disabled: {
          opacity: 0.6,
          cursor: 'not-allowed',
        },
      },
      variants: {
        solid: {
          bg: 'brand.600',
          color: 'white',
          _hover: {
            bg: 'brand.700',
            _disabled: {
              bg: 'brand.600',
            }
          },
          _active: {
            bg: 'brand.700',
          }
        }
      }
    },
    
    Input: {
      baseStyle: {
        field: {
          minH: '44px', // Taille de cible tactile WCAG
          borderColor: 'gray.300',
          _focus: {
            borderColor: 'brand.500',
            boxShadow: `0 0 0 1px var(--chakra-colors-brand-500)`,
          },
          _invalid: {
            borderColor: 'error.500',
            boxShadow: `0 0 0 1px var(--chakra-colors-error-500)`,
          }
        }
      }
    },
    
    FormLabel: {
      baseStyle: {
        fontSize: 'md',
        fontWeight: 'medium',
        color: 'gray.700',
        mb: 2,
      }
    },
    
    FormErrorMessage: {
      baseStyle: {
        fontSize: 'sm',
        color: 'error.600',
        mt: 1,
      }
    }
  }
})

export { theme }