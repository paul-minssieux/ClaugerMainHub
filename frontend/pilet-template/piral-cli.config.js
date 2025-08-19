/**
 * Configuration Piral CLI pour le template pilet
 */

module.exports = {
  // URL du shell Piral pour le développement
  piralInstance: 'http://localhost:3000',
  
  // Configuration du bundler
  bundler: {
    // Utiliser esbuild pour des builds plus rapides
    type: 'esbuild',
    
    // Options esbuild
    options: {
      target: 'es2020',
      minify: true,
      sourcemap: true,
    },
  },

  // Configuration du serveur de développement
  devServer: {
    port: 1234,
    open: true,
    hmr: true,
  },

  // Configuration de la publication
  publish: {
    // URL du feed service
    url: process.env.PILET_FEED_URL || 'https://feed.clauger.com/api/v1/pilets',
    
    // Clé API pour la publication
    apiKey: process.env.PILET_API_KEY,
    
    // Options supplémentaires
    fresh: false,
    from: 'local',
  },

  // Configuration de validation
  validate: {
    validators: [
      'has-valid-package-json',
      'has-valid-dependencies',
      'has-valid-peerDependencies',
      'can-be-built',
      'has-no-duplicate-exports',
    ],
  },

  // Alias de chemins
  alias: {
    '@': './src',
  },

  // Variables d'environnement
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },

  // Fichiers à inclure/exclure
  files: {
    include: ['src/**/*'],
    exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
  },
}