# UC 1.2 - Configuration de l'orchestrateur Piral

## 🎯 Implémentation complétée

Cette UC configure l'orchestrateur micro-frontend Piral pour ClaugerMainHub, intégrant seamlessly avec l'architecture React/TypeScript/Vite existante de UC 1.1.

## 📁 Fichiers créés/modifiés

### 1. Configuration Piral
- `src/infrastructure/orchestrator/instance/piral-config.ts`
  - Configuration environnementale (dev/staging/prod)
  - Options de cache pour les pilets
  - Headers d'authentification (préparé pour UC 2.x)
  - Validation de configuration
  - Feature flags et monitoring

### 2. Extensions API MainHub
- `src/infrastructure/orchestrator/api/mainhub-api.ts`
  - Implémentation complète de MainHubApi
  - Extensions pour notifications, thèmes, analytics, accessibilité
  - Mock d'authentification (sera remplacé en UC 2.x)
  - Intégration avec EventBus existant

### 3. Instance Piral principale
- `src/infrastructure/orchestrator/instance/piral-instance.ts`
  - Instance Piral configurée avec tous les plugins
  - Layout principal intégrant Chakra UI et FocusManager
  - Composants d'erreur et de chargement accessibles
  - Gestion robuste des erreurs de chargement
  - Fonctions utilitaires (start, stop, reload)

### 4. Point d'entrée mis à jour
- `src/main.tsx`
  - Intégration avec renderInstance de Piral
  - Fallback élégant en cas d'erreur
  - Monitoring des performances en développement
  - Support HMR pour les pilets

### 5. Configuration environnement
- `.env` - Variables pour développement
- `.env.example` - Template complet avec documentation

## 🔧 Fonctionnalités implémentées

### Architecture micro-frontend
- ✅ Instance Piral configurée avec createInstance
- ✅ Support des plugins standards (React, notifications, modals, menu, dashboard)
- ✅ Extensions API personnalisées MainHub
- ✅ Gestion du cache des pilets
- ✅ Stratégies de chargement configurables

### Intégration avec l'existant
- ✅ Intégration Chakra UI + thème accessible
- ✅ Conservation du FocusManager pour l'accessibilité
- ✅ Utilisation de l'EventBus existant
- ✅ Respect du TypeScript strict mode
- ✅ Composants d'erreur/loading accessibles WCAG 2.1 AA

### Configuration robuste
- ✅ Configuration par environnement
- ✅ Validation des variables d'environnement
- ✅ Gestion d'erreurs gracieuse (pas de crash si feed indisponible)
- ✅ Feature flags pour activation progressive
- ✅ Monitoring et métriques de performance

### API Extensions
- ✅ MainHubApi complète (user, config, auth, notifications, etc.)
- ✅ API notifications avancées
- ✅ API thèmes et personnalisation
- ✅ API analytics (préparé pour Application Insights)
- ✅ API accessibilité (announcements, focus management)

## 🚀 Démarrage

### 1. Variables d'environnement
Copier `.env.example` vers `.env` et configurer:

```bash
# Minimum requis pour UC 1.2
VITE_PILETS_FEED_URL=http://localhost:3001/api/pilets
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Démarrage de l'application
```bash
npm run dev
```

L'application démarrera avec l'orchestrateur Piral. Si le feed des pilets n'est pas disponible, l'application démarrera quand même avec une liste de pilets vide.

### 3. Serveur de feed (optionnel pour UC 1.2)
Pour tester avec des pilets réels, démarrer un serveur de feed sur le port configuré qui retourne:

```json
{
  "items": [
    {
      "name": "example-pilet",
      "version": "1.0.0",
      "link": "/path/to/pilet.js",
      "custom": {
        "category": "demo"
      }
    }
  ],
  "timestamp": 1640995200000,
  "version": "1.0.0"
}
```

## 🎨 Interface utilisateur

L'interface conserve le layout de UC 1.1 avec:
- Header ClaugerMainHub
- Sidebar navigation (280px)
- Zone de contenu principal pour les pilets
- Skip links et live regions pour l'accessibilité

## 🔌 API disponible pour les pilets

Les pilets peuvent utiliser l'API MainHub étendue:

```typescript
// Dans un pilet
export function setup(api: ClaugerPiletApi) {
  // Récupérer l'utilisateur actuel
  const user = api.getCurrentUser()
  
  // Envoyer une notification
  api.sendNotification('temporary', 'Hello from pilet!', 3000)
  
  // S'abonner à des événements
  const unsubscribe = api.subscribeToEvent('theme:change', (data) => {
    console.log('Theme changed:', data)
  })
  
  // Enregistrer un widget
  api.registerWidget({
    id: 'my-widget',
    name: 'Mon Widget',
    component: MyWidgetComponent,
    defaultSize: { width: 2, height: 2 }
  })
  
  // Logger des erreurs
  api.logError(new Error('Something went wrong'), {
    pilet: 'my-pilet',
    action: 'initialization'
  })
}
```

## 🔄 Intégration avec les UCs suivants

### UC 2.x - Authentification
- `getAuthToken()` remplacera le mock
- `getCurrentUser()` utilisera Azure Entra ID
- Headers d'authentification seront automatiquement ajoutés

### UC 3.x - Sidebar
- Menu API de Piral sera utilisé pour la navigation
- `api.registerMenuItem()` disponible

### UC 4.x - Micro-frontends
- Instance Piral déjà configurée
- API d'enregistrement et de lifecycle prête

### UC 5.x - Dashboards
- Dashboard API de Piral activée
- `api.registerWidget()` fonctionnel

### UC 6.x - Widgets
- Widget marketplace intégré via MainHubApi
- JSON Schema validation préparée

## 🐛 Gestion d'erreurs

### Erreurs de chargement de pilets
- Composant ErrorInfo accessible
- Logs détaillés en console
- Application continue de fonctionner

### Erreurs de feed
- Fallback vers liste vide
- Retry automatique configurable
- Interface d'erreur informative

### Erreurs critiques
- Fallback vers interface React classique
- Informations de débogage détaillées
- Boutons de retry et actualisation

## 📊 Monitoring et debugging

### En développement
- Logs détaillés des performances
- Métriques de chargement des pilets
- Information sur les variables d'environnement
- Support HMR

### En production (préparé)
- Application Insights intégration
- Métriques de performance automatiques
- Tracking des erreurs et exceptions

## ✅ Tests recommandés

1. **Démarrage sans feed de pilets**: L'app doit démarrer sans erreur
2. **Variables d'environnement manquantes**: Fallback sur les valeurs par défaut
3. **Chargement de pilets valides**: Intégration et API fonctionnelles
4. **Gestion d'erreurs**: Tests des différents scénarios d'erreur
5. **Accessibilité**: Navigation au clavier et annonces lecteur d'écran

## 🎯 Prochaines étapes

1. Implémenter UC 2.1-2.3 (Azure Entra ID) pour remplacer les mocks
2. Créer un serveur de feed de démonstration
3. Développer les premiers pilets de test
4. Intégrer Application Insights pour les métriques

L'orchestrateur Piral est maintenant prêt et configuré pour supporter l'architecture micro-frontend complète de ClaugerMainHub.