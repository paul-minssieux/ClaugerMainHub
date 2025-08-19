import { createContext, useContext, useRef, useCallback, ReactNode } from 'react'

interface FocusManagerContextType {
  pushFocusScope: (element: HTMLElement) => void
  popFocusScope: () => void
  restoreFocus: () => void
  trapFocus: (element: HTMLElement) => () => void
}

const FocusManagerContext = createContext<FocusManagerContextType | null>(null)

export function FocusManager({ children }: { children: ReactNode }) {
  const focusStack = useRef<HTMLElement[]>([])
  const lastFocusedElement = useRef<HTMLElement | null>(null)

  const pushFocusScope = useCallback((element: HTMLElement) => {
    // Sauvegarder l'élément actuellement focusé
    if (document.activeElement && document.activeElement !== document.body) {
      lastFocusedElement.current = document.activeElement as HTMLElement
    }
    focusStack.current.push(element)
  }, [])

  const popFocusScope = useCallback(() => {
    focusStack.current.pop()
    
    // Restaurer le focus précédent
    if (lastFocusedElement.current) {
      lastFocusedElement.current.focus()
      lastFocusedElement.current = null
    }
  }, [])

  const restoreFocus = useCallback(() => {
    if (lastFocusedElement.current) {
      lastFocusedElement.current.focus()
    }
  }, [])

  const trapFocus = useCallback((element: HTMLElement) => {
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement?.focus()
          }
        }
      }

      if (event.key === 'Escape') {
        popFocusScope()
      }
    }

    element.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => {
      element.removeEventListener('keydown', handleKeyDown)
    }
  }, [popFocusScope])

  const value = {
    pushFocusScope,
    popFocusScope,
    restoreFocus,
    trapFocus
  }

  return (
    <FocusManagerContext.Provider value={value}>
      {children}
    </FocusManagerContext.Provider>
  )
}

export function useFocusManager() {
  const context = useContext(FocusManagerContext)
  if (!context) {
    throw new Error('useFocusManager must be used within a FocusManager')
  }
  return context
}