import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/core': resolve(__dirname, './src/core'),
      '@/features': resolve(__dirname, './src/features'),
      '@/shared': resolve(__dirname, './src/shared'),
      '@/infrastructure': resolve(__dirname, './src/infrastructure'),
      '@/security': resolve(__dirname, './src/security'),
      '@/accessibility': resolve(__dirname, './src/accessibility'),
      '@/theme': resolve(__dirname, './src/theme')
    }
  },
  
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: true
    }
  },
  
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chakra-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
          'router-vendor': ['react-router-dom'],
          'state-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'query-vendor': ['@tanstack/react-query']
        }
      }
    },
    
    chunkSizeWarningLimit: 500
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion'
    ],
    exclude: [
      'piral-core',
      'piral-react',
      'piral-notifications',
      'piral-modals',
      'piral-menu',
      'piral-dashboard'
    ]
  },

  // Configuration spéciale pour Piral
  define: {
    // Éviter les erreurs de build avec Piral
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },

  // Configuration ESBuild pour les fichiers Piral
  esbuild: {
    loader: 'tsx',
    include: /\.(tsx?|jsx?)$/,
    exclude: []
  }
})