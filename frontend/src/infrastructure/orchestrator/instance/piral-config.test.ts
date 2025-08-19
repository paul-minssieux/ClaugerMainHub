/**
 * Tests unitaires pour la configuration Piral
 * UC 1.2 - Configuration de l'orchestrateur micro-frontend
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  getPiralConfig, 
  validateConfig, 
  featureFlags,
  DEFAULT_CACHE_OPTIONS,
  CRITICAL_PILETS,
  PERMISSION_LEVELS
} from './piral-config'

describe('Piral Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('getPiralConfig', () => {
    it('should return default configuration', () => {
      const config = getPiralConfig()
      
      expect(config).toMatchObject({
        feedUrl: expect.any(String),
        debug: expect.any(Boolean),
        strictMode: expect.any(Boolean),
        cacheOptions: expect.objectContaining({
          ttl: expect.any(Number),
          maxSize: expect.any(Number),
          strategy: expect.any(String),
        }),
      })
    })

    it('should use environment variables when available', () => {
      vi.stubEnv('VITE_PIRAL_FEED_URL', 'https://custom.feed.com')
      vi.stubEnv('VITE_PIRAL_DEBUG', 'true')
      vi.stubEnv('VITE_PIRAL_STRICT_MODE', 'false')
      vi.stubEnv('VITE_PIRAL_CACHE_TTL', '7200000')
      vi.stubEnv('VITE_PIRAL_CACHE_MAX_SIZE', '100')
      vi.stubEnv('VITE_PIRAL_CACHE_STRATEGY', 'network-first')

      const config = getPiralConfig()

      expect(config.feedUrl).toBe('https://custom.feed.com')
      expect(config.debug).toBe(true)
      expect(config.strictMode).toBe(false)
      expect(config.cacheOptions.ttl).toBe(7200000)
      expect(config.cacheOptions.maxSize).toBe(100)
      expect(config.cacheOptions.strategy).toBe('network-first')
    })

    it('should handle invalid environment variables gracefully', () => {
      vi.stubEnv('VITE_PIRAL_DEBUG', 'not-a-boolean')
      vi.stubEnv('VITE_PIRAL_CACHE_TTL', 'not-a-number')
      vi.stubEnv('VITE_PIRAL_CACHE_MAX_SIZE', 'not-a-number')

      const config = getPiralConfig()

      expect(config.debug).toBe(false)
      expect(config.cacheOptions.ttl).toBe(DEFAULT_CACHE_OPTIONS.ttl)
      expect(config.cacheOptions.maxSize).toBe(DEFAULT_CACHE_OPTIONS.maxSize)
    })

    it('should set default feed URL for development', () => {
      vi.stubEnv('MODE', 'development')
      vi.stubEnv('VITE_PIRAL_FEED_URL', '')

      const config = getPiralConfig()

      expect(config.feedUrl).toBe('/api/v1/pilets')
    })

    it('should require feed URL in production', () => {
      vi.stubEnv('MODE', 'production')
      vi.stubEnv('VITE_PIRAL_FEED_URL', '')

      const config = getPiralConfig()

      expect(config.feedUrl).toBe('')
    })
  })

  describe('validateConfig', () => {
    it('should validate correct configuration', () => {
      const validConfig = {
        feedUrl: 'https://feed.example.com',
        debug: false,
        strictMode: true,
        cacheOptions: {
          ttl: 3600000,
          maxSize: 50,
          strategy: 'cache-first' as const,
        },
      }

      expect(validateConfig(validConfig)).toBe(true)
    })

    it('should reject configuration without feed URL', () => {
      const invalidConfig = {
        feedUrl: '',
        debug: false,
        strictMode: true,
        cacheOptions: DEFAULT_CACHE_OPTIONS,
      }

      expect(validateConfig(invalidConfig)).toBe(false)
    })

    it('should reject configuration with invalid cache TTL', () => {
      const invalidConfig = {
        feedUrl: 'https://feed.example.com',
        debug: false,
        strictMode: true,
        cacheOptions: {
          ttl: -1,
          maxSize: 50,
          strategy: 'cache-first' as const,
        },
      }

      expect(validateConfig(invalidConfig)).toBe(false)
    })

    it('should reject configuration with invalid cache size', () => {
      const invalidConfig = {
        feedUrl: 'https://feed.example.com',
        debug: false,
        strictMode: true,
        cacheOptions: {
          ttl: 3600000,
          maxSize: 0,
          strategy: 'cache-first' as const,
        },
      }

      expect(validateConfig(invalidConfig)).toBe(false)
    })

    it('should reject configuration with invalid cache strategy', () => {
      const invalidConfig = {
        feedUrl: 'https://feed.example.com',
        debug: false,
        strictMode: true,
        cacheOptions: {
          ttl: 3600000,
          maxSize: 50,
          strategy: 'invalid-strategy' as any,
        },
      }

      expect(validateConfig(invalidConfig)).toBe(false)
    })

    it('should reject configuration with missing cache options', () => {
      const invalidConfig = {
        feedUrl: 'https://feed.example.com',
        debug: false,
        strictMode: true,
      } as any

      expect(validateConfig(invalidConfig)).toBe(false)
    })
  })

  describe('Feature Flags', () => {
    it('should have all required feature flags', () => {
      expect(featureFlags).toHaveProperty('enableCache')
      expect(featureFlags).toHaveProperty('enableErrorBoundaries')
      expect(featureFlags).toHaveProperty('enableLazyLoading')
      expect(featureFlags).toHaveProperty('enablePreloading')
      expect(featureFlags).toHaveProperty('enableServiceWorker')
      expect(featureFlags).toHaveProperty('enableDebugTools')
      expect(featureFlags).toHaveProperty('enablePerformanceMonitoring')
      expect(featureFlags).toHaveProperty('enableAnalytics')
    })

    it('should have correct default values', () => {
      expect(featureFlags.enableCache).toBe(true)
      expect(featureFlags.enableErrorBoundaries).toBe(true)
      expect(featureFlags.enableLazyLoading).toBe(true)
      expect(featureFlags.enablePreloading).toBe(true)
      expect(featureFlags.enableServiceWorker).toBe(false)
      expect(featureFlags.enableDebugTools).toBe(false)
      expect(featureFlags.enablePerformanceMonitoring).toBe(false)
      expect(featureFlags.enableAnalytics).toBe(false)
    })
  })

  describe('Constants', () => {
    it('should define default cache options', () => {
      expect(DEFAULT_CACHE_OPTIONS).toMatchObject({
        ttl: 3600000, // 1 hour
        maxSize: 50,
        strategy: 'cache-first',
      })
    })

    it('should define critical pilets list', () => {
      expect(CRITICAL_PILETS).toEqual([
        'sidebar',
        'dashboard',
        'navigation',
      ])
    })

    it('should define permission levels', () => {
      expect(PERMISSION_LEVELS).toMatchObject({
        PUBLIC: 0,
        USER: 1,
        MANAGER: 2,
        ADMIN: 3,
        SUPER_ADMIN: 4,
      })
    })

    it('should have ordered permission levels', () => {
      const levels = Object.values(PERMISSION_LEVELS)
      expect(levels).toEqual([0, 1, 2, 3, 4])
      expect(levels).toEqual([...levels].sort((a, b) => a - b))
    })
  })

  describe('Environment Detection', () => {
    it('should detect development environment', () => {
      vi.stubEnv('MODE', 'development')
      vi.stubEnv('VITE_PIRAL_DEBUG', '')

      const config = getPiralConfig()

      expect(config.debug).toBe(true)
    })

    it('should detect production environment', () => {
      vi.stubEnv('MODE', 'production')
      vi.stubEnv('VITE_PIRAL_DEBUG', '')

      const config = getPiralConfig()

      expect(config.debug).toBe(false)
    })

    it('should detect staging environment', () => {
      vi.stubEnv('MODE', 'staging')
      vi.stubEnv('VITE_PIRAL_DEBUG', '')

      const config = getPiralConfig()

      expect(config.debug).toBe(false)
    })
  })

  describe('Cache Strategies', () => {
    it('should support cache-first strategy', () => {
      vi.stubEnv('VITE_PIRAL_CACHE_STRATEGY', 'cache-first')

      const config = getPiralConfig()

      expect(config.cacheOptions.strategy).toBe('cache-first')
    })

    it('should support network-first strategy', () => {
      vi.stubEnv('VITE_PIRAL_CACHE_STRATEGY', 'network-first')

      const config = getPiralConfig()

      expect(config.cacheOptions.strategy).toBe('network-first')
    })

    it('should support cache-only strategy', () => {
      vi.stubEnv('VITE_PIRAL_CACHE_STRATEGY', 'cache-only')

      const config = getPiralConfig()

      expect(config.cacheOptions.strategy).toBe('cache-only')
    })

    it('should support network-only strategy', () => {
      vi.stubEnv('VITE_PIRAL_CACHE_STRATEGY', 'network-only')

      const config = getPiralConfig()

      expect(config.cacheOptions.strategy).toBe('network-only')
    })

    it('should default to cache-first for invalid strategy', () => {
      vi.stubEnv('VITE_PIRAL_CACHE_STRATEGY', 'invalid-strategy')

      const config = getPiralConfig()

      expect(config.cacheOptions.strategy).toBe('cache-first')
    })
  })
})