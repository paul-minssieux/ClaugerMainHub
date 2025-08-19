import { defineConfig, mergeConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // Environnement
      environment: 'jsdom',
      globals: true,
      
      // Setup
      setupFiles: ['./src/test/setup.ts'],
      
      // Coverage
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'src/test/',
          '*.config.{js,ts}',
          'src/main.tsx',
          'src/vite-env.d.ts',
          '**/*.d.ts',
          '**/*.stories.tsx',
          '**/index.ts', // barrel exports
        ],
        thresholds: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      
      // Patterns
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: [...configDefaults.exclude, 'e2e/**'],
      
      // Timeouts
      testTimeout: 10000,
      hookTimeout: 10000,
      
      // Reporter
      reporters: ['verbose'],
    },
  })
)