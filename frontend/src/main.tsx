import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react'
import { Piral } from 'piral'
import { ChakraProvider } from '@chakra-ui/react'
import './index.css'
import { instance, PiralApp } from '@/infrastructure/orchestrator/instance/piral-instance'
import { theme } from '@/theme/accessible-theme'

// Configuration de l'environnement
const isDevelopment = import.meta.env.DEV

// Le composant PiralApp est maintenant importé depuis piral-instance

// Initialisation de l'application
async function initializeApp() {
  try {
    console.log('🚀 Initializing ClaugerMainHub with Piral...')
    
    // Configurer les composants par défaut
    const rootElement = document.getElementById('root')
    if (!rootElement) {
      throw new Error('Root element not found')
    }

    // Créer et render l'application avec React 18
    const root = createRoot(rootElement)
    root.render(
      <StrictMode>
        <PiralApp />
      </StrictMode>
    )
    
    console.log('✅ ClaugerMainHub initialized successfully with Piral')
    
    // Message de debug pour le développement
    if (isDevelopment) {
      console.log('🔧 Development mode active')
      console.log('📦 Piral instance:', instance)
      console.log('🌐 Environment variables loaded:')
      console.log('  - Feed URL:', import.meta.env.VITE_PILETS_FEED_URL || 'http://localhost:3001/api/pilets')
      console.log('  - API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api')
      console.log('  - Mode:', import.meta.env.MODE)
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize ClaugerMainHub:', error)
    
    // Fallback en cas d'erreur critique - render un composant React classique
    const root = createRoot(document.getElementById('root')!)
    root.render(
      <StrictMode>
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          maxWidth: '800px',
          margin: '0 auto',
          marginTop: '4rem'
        }}>
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h1 style={{ 
              color: '#dc2626', 
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              ⚠️ Erreur de démarrage de ClaugerMainHub
            </h1>
            <p style={{ 
              marginBottom: '1rem',
              color: '#374151',
              lineHeight: '1.5'
            }}>
              L'orchestrateur Piral n'a pas pu démarrer correctement. Cela peut être dû à:
            </p>
            <ul style={{ 
              textAlign: 'left', 
              color: '#6b7280',
              marginBottom: '1.5rem',
              paddingLeft: '1.5rem',
              lineHeight: '1.6'
            }}>
              <li>Le serveur de feed des pilets n'est pas accessible</li>
              <li>Une erreur de configuration des variables d'environnement</li>
              <li>Un problème de réseau ou de connectivité</li>
            </ul>
          </div>
          
          <div style={{
            background: '#f3f4f6',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ 
              marginBottom: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              Configuration actuelle:
            </h3>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'left' }}>
              <p><strong>Feed URL:</strong> {import.meta.env.VITE_PILETS_FEED_URL || 'Non défini'}</p>
              <p><strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'Non défini'}</p>
              <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
            </div>
          </div>

          <details style={{ 
            textAlign: 'left', 
            maxWidth: '600px', 
            margin: '0 auto 1.5rem auto',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1rem'
          }}>
            <summary style={{ 
              cursor: 'pointer',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Détails techniques de l'erreur
            </summary>
            <pre style={{ 
              background: '#f9fafb', 
              padding: '1rem', 
              borderRadius: '0.25rem',
              overflow: 'auto',
              fontSize: '0.75rem',
              color: '#374151',
              border: '1px solid #e5e7eb'
            }}>
              {error instanceof Error ? 
                `${error.name}: ${error.message}\n\n${error.stack}` : 
                String(error)}
            </pre>
          </details>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              🔄 Actualiser la page
            </button>
            
            <button 
              onClick={() => {
                console.clear()
                initializeApp()
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.875rem'
              }}
            >
              🔄 Réessayer
            </button>
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: '#0c4a6e'
          }}>
            <h4 style={{ marginBottom: '0.5rem', fontWeight: '500' }}>
              ℹ️ Mode de développement
            </h4>
            <p>
              En développement, assurez-vous que le serveur de feed des pilets est démarré 
              sur <code style={{ background: 'white', padding: '0.125rem 0.25rem', borderRadius: '0.125rem' }}>
                {import.meta.env.VITE_PILETS_FEED_URL || 'http://localhost:3001/api/pilets'}
              </code>
            </p>
          </div>
        </div>
      </StrictMode>
    )
  }
}

// Performance monitoring en développement
if (isDevelopment) {
  // Observer les performances
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'measure') {
        console.log(`⏱️ ${entry.name}: ${entry.duration.toFixed(2)}ms`)
      }
    })
  })
  
  try {
    observer.observe({ entryTypes: ['measure'] })
  } catch {
    // PerformanceObserver n'est pas supporté dans tous les environnements
    console.warn('PerformanceObserver not supported')
  }
}

// Hot Module Replacement (HMR) pour le développement
if (isDevelopment && import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      console.log('🔄 Hot reload triggered')
      // TODO: Implémenter le hot reload pour les pilets
    }
  })
  
  import.meta.hot.dispose(() => {
    console.log('🧹 Cleaning up for hot reload')
    // Cleanup des event listeners et autres ressources
  })
}

// Gestion des erreurs non capturées
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  
  // TODO: Envoyer à Application Insights en production
  if (!isDevelopment) {
    // window.appInsights?.trackException({ exception: event.error })
  }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  
  // TODO: Envoyer à Application Insights en production
  if (!isDevelopment) {
    // window.appInsights?.trackException({ exception: new Error(event.reason) })
  }
})

// Métriques de démarrage
if (isDevelopment) {
  const startTime = performance.now()
  window.addEventListener('load', () => {
    const loadTime = performance.now() - startTime
    console.log(`📊 Application loaded in ${loadTime.toFixed(2)}ms`)
  })
}

// Initialiser l'application
initializeApp()