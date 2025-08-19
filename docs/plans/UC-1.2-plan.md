# 📋 Plan de Développement - UC 1.2

## 🎯 Résumé Exécutif
- **Objectif**: Configuration de l'orchestrateur micro-frontend avec Piral pour permettre l'intégration dynamique des applications
- **Complexité**: L (Large) - 8 Story Points  
- **Durée estimée**: 24-32 heures
- **Risques identifiés**: 
  - Courbe d'apprentissage Piral pour les équipes
  - Migration des micro-frontends existants vers pilets
  - Configuration du feed service en production
  - Gestion du versioning des pilets

## 🏗️ Architecture Technique

### Composants à créer
1. **Piral Instance**
   - Type: Core Orchestrator Service
   - Localisation: `frontend/src/infrastructure/orchestrator/`
   - Dépendances: piral-core, piral-react, extensions Piral

2. **Feed Service**
   - Type: Service de découverte des pilets
   - Localisation: `frontend/src/infrastructure/orchestrator/feed/`
   - Dépendances: axios, cache manager

3. **MainHub API Extensions**
   - Type: API personnalisée pour pilets
   - Localisation: `frontend/src/infrastructure/orchestrator/api/`
   - Dépendances: EventBus existant, auth service

4. **Pilet Cache Manager**
   - Type: Service de cache et performance
   - Localisation: `frontend/src/infrastructure/orchestrator/cache/`
   - Dépendances: IndexedDB, service worker

5. **Error Boundaries**
   - Type: Composants React d'isolation
   - Localisation: `frontend/src/infrastructure/orchestrator/components/`
   - Dépendances: React Error Boundary

### Patterns utilisés
- **Micro Frontend Pattern**: Architecture avec Piral shell et pilets
- **Plugin Architecture**: Système extensible via API Piral
- **Feed Service Pattern**: Découverte dynamique des modules
- **Cache-First Strategy**: Optimisation performance avec cache local
- **Error Isolation**: Boundaries pour isolation des erreurs par pilet
- **Event-Driven Communication**: Extension de l'EventBus existant

### Structure des dossiers
```
frontend/
├── src/
│   ├── infrastructure/
│   │   └── orchestrator/
│   │       ├── instance/
│   │       │   ├── piral-instance.ts      # Instance Piral principale
│   │       │   ├── piral-config.ts        # Configuration
│   │       │   └── piral-types.ts         # Types TypeScript
│   │       ├── feed/
│   │       │   ├── feed-service.ts        # Service de feed
│   │       │   ├── feed-cache.ts          # Cache des métadonnées
│   │       │   └── feed-filter.ts         # Filtrage par permissions
│   │       ├── api/
│   │       │   ├── mainhub-api.ts         # API MainHub étendue
│   │       │   ├── api-extensions.ts      # Extensions personnalisées
│   │       │   └── api-types.ts           # Types d'API
│   │       ├── cache/
│   │       │   ├── pilet-cache.ts         # Cache des pilets
│   │       │   ├── cache-manager.ts       # Gestionnaire de cache
│   │       │   └── cache-strategies.ts    # Stratégies de cache
│   │       ├── components/
│   │       │   ├── ErrorBoundary.tsx      # Boundary d'erreur
│   │       │   ├── LoadingIndicator.tsx   # Indicateur de chargement
│   │       │   └── PiletWrapper.tsx       # Wrapper pour pilets
│   │       └── utils/
│   │           ├── pilet-loader.ts        # Chargeur de pilets
│   │           └── performance.ts         # Monitoring performance
│   └── pages/
│       └── orchestrator/
│           ├── Dashboard.tsx              # Dashboard avec tiles
│           └── AdminPanel.tsx             # Panel admin pilets
│
├── pilet-template/                        # Template pour nouveaux pilets
│   ├── src/
│   │   ├── index.tsx                     # Point d'entrée pilet
│   │   └── types.d.ts                    # Types MainHub
│   ├── package.json
│   ├── tsconfig.json
│   └── piral-cli.config.js
│
└── scripts/
    ├── build-pilet.js                    # Script build pilet
    └── publish-pilet.js                  # Script publication
```

## 📝 Tâches de Développement

### Phase 1: Setup et Installation Piral ⚙️
- [ ] Installer piral-core et piral-react
- [ ] Installer les extensions Piral nécessaires (notifications, modals, menu, dashboard)
- [ ] Configurer les types TypeScript pour Piral
- [ ] Créer la structure de dossiers orchestrator
- [ ] Configurer piral-cli pour le développement
- [ ] Adapter la configuration Vite existante

### Phase 2: Configuration Instance Piral 🎯
- [ ] Créer l'instance Piral avec état initial
- [ ] Configurer les composants de base (Layout, ErrorInfo, LoadingIndicator)
- [ ] Implémenter les routes principales
- [ ] Configurer les plugins React et extensions
- [ ] Intégrer avec le thème Chakra UI existant
- [ ] Configurer le mode debug et strict mode

### Phase 3: API MainHub et Extensions 🔌
- [ ] Créer l'interface MainHubApi avec toutes les méthodes
- [ ] Implémenter getCurrentUser() avec auth existante
- [ ] Implémenter getConfiguration() avec config app
- [ ] Créer sendNotification() avec types temporary/persistent
- [ ] Intégrer registerWidget() pour dashboard
- [ ] Connecter subscribeToEvent() avec EventBus existant
- [ ] Implémenter logError() avec Application Insights
- [ ] Créer les types TypeScript complets

### Phase 4: Feed Service et Permissions 🔐
- [ ] Créer le service de fetch des pilets
- [ ] Implémenter l'authentification Bearer token
- [ ] Créer le système de filtrage par rôles/permissions
- [ ] Implémenter le cache des métadonnées pilets
- [ ] Gérer les erreurs de chargement avec fallback
- [ ] Créer le endpoint API backend /api/v1/pilets
- [ ] Configurer CORS pour le feed service

### Phase 5: Cache et Performance ⚡
- [ ] Implémenter PiletCache avec Map/IndexedDB
- [ ] Créer stratégie cache-first avec TTL
- [ ] Implémenter préchargement des pilets critiques
- [ ] Optimiser l'évaluation des pilets (Function vs eval)
- [ ] Mesurer et optimiser temps de chargement < 1s
- [ ] Implémenter lazy loading des pilets non-critiques
- [ ] Configurer service worker pour cache offline

### Phase 6: Error Boundaries et Isolation 🛡️
- [ ] Créer CustomErrorBoundary pour pilets
- [ ] Implémenter isolation des erreurs par pilet
- [ ] Créer LoadingError component
- [ ] Gérer les erreurs de chargement réseau
- [ ] Logger les erreurs dans Application Insights
- [ ] Créer mécanisme de retry automatique
- [ ] Implémenter fallback UI pour pilets en erreur

### Phase 7: Template Pilet et Documentation 📚
- [ ] Créer pilet-template avec structure complète
- [ ] Configurer TypeScript pour pilets
- [ ] Créer exemple d'utilisation API MainHub
- [ ] Documenter le processus de création pilet
- [ ] Créer guide de migration micro-frontend → pilet
- [ ] Documenter les bonnes pratiques et patterns
- [ ] Créer exemples de widgets et pages

### Phase 8: Mode Développement et Debug 🔧
- [ ] Configurer piral-cli pour dev local
- [ ] Implémenter HMR pour pilets
- [ ] Créer scripts npm pour développement pilet
- [ ] Configurer proxy pour API en dev
- [ ] Créer outils de debug (Piral Inspector)
- [ ] Documenter le workflow développement
- [ ] Créer environnement de test pilets

### Phase 9: Tests et Validation 🧪
- [ ] Tests unitaires Piral instance (> 80% coverage)
- [ ] Tests d'intégration feed service
- [ ] Tests de performance chargement < 1s
- [ ] Tests d'isolation des erreurs
- [ ] Tests de l'API MainHub complète
- [ ] Tests E2E avec pilet de test
- [ ] Tests de compatibilité navigateurs
- [ ] Tests de charge avec multiples pilets

### Phase 10: CI/CD et Déploiement 🚀
- [ ] Configurer build pilets dans CI
- [ ] Créer pipeline de publication pilets
- [ ] Configurer registry privé pour pilets
- [ ] Implémenter versioning sémantique
- [ ] Créer stratégie de rollback pilets
- [ ] Documenter processus de déploiement
- [ ] Configurer monitoring en production

## 🧪 Stratégie de Tests

### Tests Unitaires
```typescript
describe('Piral Instance', () => {
  it('should initialize with correct configuration')
  it('should load plugins successfully')
  it('should handle state management')
  it('should provide MainHub API to pilets')
})

describe('Feed Service', () => {
  it('should fetch pilets with authentication')
  it('should filter pilets by permissions')
  it('should handle network errors gracefully')
  it('should use cached pilets on error')
})

describe('Pilet Cache', () => {
  it('should cache pilet content')
  it('should respect TTL configuration')
  it('should preload critical pilets')
  it('should clear expired cache entries')
})
```

### Tests d'Intégration
- Chargement complet d'un pilet avec API
- Communication entre pilets via EventBus
- Gestion des permissions et rôles
- Intégration avec services existants (auth, config)
- Performance de bout en bout

### Tests E2E
- Flow complet: login → chargement pilets → interaction
- Navigation entre pilets
- Gestion des erreurs et recovery
- Performance sur connexions lentes
- Comportement offline avec cache

### Tests de Performance
- Temps de chargement initial < 2s
- Temps de chargement pilet < 1s
- Memory footprint par pilet < 5MB
- Pas de memory leaks sur mount/unmount
- Bundle size optimisé

## 🔒 Sécurité
- [x] Authentification Bearer token pour feed
- [x] Filtrage des pilets par permissions
- [x] Isolation des pilets (sandboxing)
- [x] Validation des métadonnées pilets
- [x] CSP adapté pour pilets dynamiques
- [x] Audit des dépendances pilets
- [ ] Signature et vérification des pilets
- [ ] Rate limiting sur feed service

## ⚡ Performance

| Métrique | Cible | Mesure | Statut |
|----------|-------|--------|--------|
| Temps chargement shell | < 2s | À mesurer | ⏳ |
| Temps chargement pilet | < 1s | À mesurer | ⏳ |
| Memory per pilet | < 5MB | À mesurer | ⏳ |
| Cache hit ratio | > 80% | À mesurer | ⏳ |
| Bundle size shell | < 300KB | À mesurer | ⏳ |
| Lighthouse score | > 85 | À mesurer | ⏳ |

## ♿ Accessibilité
- [x] Préservation de la navigation clavier entre pilets
- [x] Annonces ARIA pour chargement pilets
- [x] Focus management lors des transitions
- [x] Error messages accessibles
- [x] Loading states annoncés
- [ ] Tests avec screen readers
- [ ] Validation WCAG 2.1 AA par pilet

## 🌍 Internationalisation
- [x] Support i18n dans API MainHub
- [x] Propagation de la langue aux pilets
- [ ] Chargement dynamique des traductions pilet
- [ ] Fallback langue par défaut
- [ ] Format dates/nombres dans pilets
- [ ] Support RTL future-proof

## 🔗 Dépendances

### Modules internes
- EventBus (UC 1.1) ✅
- API contract (UC 1.1) ✅
- Theme Chakra UI (UC 1.1) ✅
- Auth service (futur UC 2.x)
- Application Insights (futur UC 1.10)

### Packages npm essentiels
```json
{
  "piral-core": "^1.5.0",
  "piral-react": "^1.5.0",
  "piral-notifications": "^1.5.0",
  "piral-modals": "^1.5.0",
  "piral-menu": "^1.5.0",
  "piral-dashboard": "^1.5.0",
  "piral-cli": "^1.5.0"
}
```

### APIs externes
- Feed Service endpoint (/api/v1/pilets)
- Pilet Registry (CDN ou serveur statique)
- Application Insights (logging)

## ⚠️ Points d'Attention

1. **Migration Progressive**: Stratégie pour migrer les micro-frontends existants vers pilets
2. **Versioning Pilets**: Gestion des versions et compatibilité
3. **Performance Mobile**: Validation sur appareils mobiles et connexions lentes
4. **Debugging Production**: Outils pour débugger les pilets en production
5. **Rollback Strategy**: Mécanisme de rollback rapide en cas de problème
6. **Documentation Équipes**: Formation et documentation pour les équipes de développement
7. **Monitoring**: Métriques spécifiques aux pilets dans Application Insights

## ✅ Definition of Done
- [ ] Code review approuvée (min 2 reviewers)
- [ ] Tests unitaires > 80% coverage
- [ ] Tests d'intégration passants
- [ ] Instance Piral fonctionnelle
- [ ] Feed service avec auth opérationnel
- [ ] API MainHub complète et documentée
- [ ] Template pilet créé et testé
- [ ] Performance < 1s validée
- [ ] Pas de memory leaks détectés
- [ ] Documentation développeur complète
- [ ] CI/CD configuré pour pilets
- [ ] Accessibilité WCAG 2.1 AA validée
- [ ] Sécurité auditée et validée

## 📊 Métriques de Succès

- **Setup Time**: < 10 minutes pour créer un nouveau pilet
- **Build Time**: < 30 secondes par pilet
- **Load Time**: < 1 seconde par pilet
- **Cache Hit Rate**: > 80% après première visite
- **Error Rate**: < 0.1% de chargements échoués
- **Developer Satisfaction**: Score > 4/5

## 🚀 Commandes Principales

```bash
# Installation Piral
npm install piral-core piral-react piral-cli

# Développement shell
npm run dev:shell

# Développement pilet
npm run dev:pilet

# Build pilet
npm run build:pilet

# Publier pilet
npm run publish:pilet

# Tests orchestrateur
npm run test:orchestrator

# Debug Piral
npm run debug:piral

# Analyse bundle
npm run analyze:piral
```

## 📅 Timeline Estimée

| Phase | Durée | Dépendances |
|-------|-------|-------------|
| Setup Piral | 2-3h | UC 1.1 ✅ |
| Instance Piral | 3-4h | Phase 1 |
| API MainHub | 3-4h | Phase 2 |
| Feed Service | 3-4h | Phase 3 |
| Cache & Perf | 3-4h | Phase 4 |
| Error Boundaries | 2-3h | Phase 2 |
| Template Pilet | 2-3h | Phase 3 |
| Mode Dev | 2-3h | Phase 7 |
| Tests | 3-4h | Phases 1-8 |
| CI/CD | 2-3h | Phase 9 |

**Total**: 24-32 heures

## 🎓 Ressources et Documentation

- [Piral Documentation](https://piral.io/)
- [Piral Tutorial](https://docs.piral.io/tutorials/introduction)
- [Piral API Reference](https://docs.piral.io/reference/api)
- [Micro Frontends Architecture](https://micro-frontends.org/)
- [Module Federation Concepts](https://webpack.js.org/concepts/module-federation/)
- [Piral Best Practices](https://docs.piral.io/guidelines/best-practices)

---

*Plan généré le 19/08/2025 pour l'UC 1.2 - ClaugerMainHub*