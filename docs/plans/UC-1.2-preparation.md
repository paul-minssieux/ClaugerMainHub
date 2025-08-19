# 🚀 UC 1.2 - Configuration de l'orchestrateur micro-frontend

## 📋 Préparation et Contexte

### État Actuel (Post UC 1.1)
✅ **Architecture React/TypeScript** avec Vite configurée  
✅ **Structure modulaire** en place dans `frontend/src/`  
✅ **EventBus** pour communication inter-modules  
✅ **API contract** défini dans `window.ClaugerMainHub`  
✅ **Sécurité de base** (CSP, XSS protection)  
✅ **Accessibilité WCAG AA** implémentée  

### Objectif UC 1.2
Transformer l'application monolithique React en orchestrateur capable de charger et gérer dynamiquement des micro-frontends indépendants.

## 🔍 Analyse Comparative

### Single-spa vs Piral

| Critère | Single-spa | Piral | Recommandation |
|---------|------------|-------|----------------|
| **Maturité** | ⭐⭐⭐⭐⭐ Très mature (2018) | ⭐⭐⭐ Plus récent (2019) | Single-spa |
| **Communauté** | ⭐⭐⭐⭐⭐ Large | ⭐⭐⭐ Moyenne | Single-spa |
| **Flexibilité** | ⭐⭐⭐⭐⭐ Très flexible | ⭐⭐⭐ Opinionated | Single-spa |
| **Vite Support** | ⭐⭐⭐⭐ Via plugins | ⭐⭐⭐ Support basique | Single-spa |
| **TypeScript** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Bon | Single-spa |
| **Learning Curve** | ⭐⭐⭐ Modérée | ⭐⭐⭐⭐ Plus simple | Égalité |
| **Module Federation** | ⭐⭐⭐⭐⭐ Compatible | ⭐⭐⭐ Support limité | Single-spa |

### 🎯 Décision : **Single-spa**

**Raisons principales** :
1. Maturité et stabilité pour un projet entreprise
2. Large communauté et écosystème
3. Flexibilité maximale pour architecture custom
4. Meilleure compatibilité avec Vite Module Federation
5. Support TypeScript natif excellent

## 📝 Plan d'Implémentation UC 1.2

### Phase 1 : Installation et Configuration Single-spa
```bash
# Dépendances core
npm install single-spa single-spa-react
npm install @types/single-spa-react -D

# Module Federation pour Vite
npm install @originjs/vite-plugin-federation -D
```

### Phase 2 : Structure des Micro-frontends

```
ClaugerMainHub/
├── frontend/                    # Shell principal (orchestrateur)
│   ├── src/
│   │   ├── orchestrator/       # Single-spa config
│   │   │   ├── registry.ts     # Registry des MFs
│   │   │   ├── router.ts       # Routing dynamique
│   │   │   └── loader.ts       # Chargement des MFs
│   │   └── ...
│   └── vite.config.ts          # Host config
│
├── micro-frontends/            # Dossier des MFs
│   ├── mf-sidebar/            # UC 3.x
│   ├── mf-dashboard/          # UC 5.x
│   ├── mf-widgets/            # UC 6.x
│   └── mf-auth/               # UC 2.x
```

### Phase 3 : Configuration Module Federation

```typescript
// vite.config.ts - Shell principal
export default defineConfig({
  plugins: [
    federation({
      name: 'clauger-shell',
      remotes: {
        sidebar: 'http://localhost:3001/remoteEntry.js',
        dashboard: 'http://localhost:3002/remoteEntry.js',
        // Dynamiquement extensible
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        '@chakra-ui/react': { singleton: true }
      }
    })
  ]
})
```

### Phase 4 : Registry des Micro-frontends

```typescript
// orchestrator/registry.ts
interface MicroFrontend {
  name: string
  url: string
  activeWhen: (location: Location) => boolean
  customProps?: Record<string, any>
}

const registry: MicroFrontend[] = [
  {
    name: '@clauger/sidebar',
    url: '//localhost:3001/clauger-sidebar.js',
    activeWhen: () => true, // Toujours visible
  },
  {
    name: '@clauger/dashboard',
    url: '//localhost:3002/clauger-dashboard.js',
    activeWhen: location => location.pathname.startsWith('/dashboard'),
  }
]
```

### Phase 5 : Communication Avancée

```typescript
// Étendre l'EventBus existant
interface MicroFrontendEvent {
  source: string
  target?: string
  type: string
  payload: any
}

class OrchestrationBus extends EventBus {
  registerMicroFrontend(name: string) { /* ... */ }
  unregisterMicroFrontend(name: string) { /* ... */ }
  broadcastToAll(event: MicroFrontendEvent) { /* ... */ }
}
```

## 🔧 Tâches Détaillées UC 1.2

### Configuration (4-5h)
- [ ] Installer single-spa et dépendances
- [ ] Configurer Module Federation avec Vite
- [ ] Créer structure orchestrator/
- [ ] Adapter le shell React existant

### Registry & Loader (3-4h)
- [ ] Implémenter registry des micro-frontends
- [ ] Créer système de chargement dynamique
- [ ] Gérer les erreurs de chargement
- [ ] Implémenter fallbacks

### Routing (2-3h)
- [ ] Configurer single-spa router
- [ ] Intégrer avec React Router
- [ ] Gérer navigation inter-MFs
- [ ] Implémenter history sync

### Communication (2-3h)
- [ ] Étendre EventBus pour orchestration
- [ ] Créer système de messaging
- [ ] Implémenter state sharing
- [ ] Gérer lifecycle events

### Premier Micro-frontend (3-4h)
- [ ] Créer mf-sidebar comme POC
- [ ] Configurer build indépendant
- [ ] Tester intégration
- [ ] Valider communication

### Tests & Documentation (2-3h)
- [ ] Tests d'intégration orchestrateur
- [ ] Tests de chargement MFs
- [ ] Documentation développeur
- [ ] Guide de création MF

## 📊 Critères de Succès UC 1.2

- ✅ Single-spa configuré et fonctionnel
- ✅ Au moins 1 micro-frontend chargé dynamiquement
- ✅ Communication bidirectionnelle fonctionnelle
- ✅ Routing inter-MFs opérationnel
- ✅ Fallbacks et gestion d'erreurs
- ✅ Performance : chargement < 2s
- ✅ Tests d'intégration passants

## 🚦 Prochaines Étapes

1. **Créer ADR** pour choix Single-spa
2. **Installer dépendances** Single-spa
3. **Configurer Module Federation**
4. **Créer premier micro-frontend** (sidebar)
5. **Valider intégration** complète

## 📅 Estimation

**Durée totale** : 16-20 heures  
**Complexité** : M (Medium) - 5 Story Points  
**Priorité** : HAUTE - Bloquant pour UC 3.x, 5.x, 6.x

---

*Document préparé le 19/08/2025 - Prêt pour implémentation UC 1.2*