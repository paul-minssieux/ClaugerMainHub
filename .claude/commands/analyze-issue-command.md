---
allowed-tools: Bash(git status:*), Bash(git branch:*), Bash(git log:*)
description: Analyse une issue GitHub et crée un plan de développement détaillé
---

# 🎯 Analyse d'Issue et Création de Plan

## Arguments
Issue GitHub: #$ARGUMENTS

## Context
- Branche actuelle: !`git branch --show-current`
- État du projet: !`git status --short`
- Derniers commits: !`git log --oneline -5`

## Instructions

### 📥 Phase 1: Récupération de l'Issue

Utilise le serveur MCP GitHub pour récupérer l'issue #$ARGUMENTS du repository ClaugerMainHub de paul-minssieux. 

Affiche en détail:
- Le titre et la description complète
- Les critères d'acceptation
- Les spécifications techniques
- Les tests requis
- Les dépendances identifiées
- Les labels et priorité

### 🏗️ Phase 2: Analyse Architecturale

En utilisant les agents spécialisés disponibles dans le projet, effectue une analyse complète :

1. **Agent Architecte** (`agent-architecte-claude-code.md`):
   - Identifier les composants à créer/modifier
   - Définir les patterns d'architecture appropriés (Repository, Factory, Observer, etc.)
   - Lister les dépendances techniques nécessaires
   - Identifier les points d'intégration avec les modules existants
   - Proposer la structure des dossiers selon les standards du projet

2. **Agent Test Engineer** (`test-engineer-agent.md`):
   - Définir la stratégie de tests complète
   - Lister les tests unitaires nécessaires (objectif coverage > 80%)
   - Planifier les tests d'intégration
   - Définir les scénarios E2E avec Cypress/Playwright
   - Identifier les données de test nécessaires

3. **Agent Sécurité** (`security-agent.md`):
   - Identifier les points de sécurité critiques
   - Vérifier les besoins d'authentification/autorisation
   - Planifier la validation des entrées
   - Identifier les risques OWASP applicables
   - Définir les règles de sanitization nécessaires

4. **Agent Performance** (`performance-agent.md`):
   - Définir les métriques de performance cibles
   - Identifier les optimisations nécessaires (lazy loading, code splitting)
   - Planifier le monitoring des performances
   - Objectif Lighthouse > 80

5. **Agent Accessibilité** (`accessibility-agent.md`):
   - Lister les exigences WCAG 2.1 AA applicables
   - Identifier les attributs ARIA nécessaires
   - Planifier les tests d'accessibilité avec axe-core
   - Définir les contrastes et navigation clavier

6. **Agent Intégration** (`integration-agent.md`):
   - Mapper les dépendances avec les modules existants
   - Identifier les contrats d'API à respecter
   - Planifier la migration de données si nécessaire
   - Vérifier la compatibilité avec les micro-frontends existants

### 📋 Phase 3: Création du Plan Détaillé

Génère un plan de développement structuré incluant:

```markdown
# 📋 Plan de Développement - UC [X.Y]

## 🎯 Résumé Exécutif
- **Objectif**: [Description courte]
- **Complexité**: [XS/S/M/L/XL]
- **Durée estimée**: [X heures]
- **Risques identifiés**: [Liste]

## 🏗️ Architecture Technique

### Composants à créer
1. [Composant 1]
   - Type: [React Component/Service/Hook]
   - Localisation: [src/modules/...]
   - Dépendances: [Liste]

### Patterns utilisés
- [Pattern 1]: [Justification]
- [Pattern 2]: [Justification]

### Structure des dossiers
```
src/
├── modules/
│   └── [module]/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── tests/
```

## 📝 Tâches de Développement

### Phase 1: Setup et Configuration
- [ ] Créer la structure des dossiers
- [ ] Installer les dépendances npm
- [ ] Configurer TypeScript/ESLint

### Phase 2: Développement Core
- [ ] Créer les interfaces TypeScript
- [ ] Implémenter les composants React
- [ ] Développer la logique métier
- [ ] Intégrer Redux/Context

### Phase 3: Tests
- [ ] Tests unitaires (> 80% coverage)
- [ ] Tests d'intégration
- [ ] Tests E2E

### Phase 4: Optimisation
- [ ] Performance (Lighthouse > 80)
- [ ] Accessibilité (WCAG 2.1 AA)
- [ ] Sécurité
- [ ] Bundle size

### Phase 5: Documentation
- [ ] Documentation technique
- [ ] JSDoc complet
- [ ] README du module
- [ ] Exemples d'utilisation

## 🧪 Stratégie de Tests

### Tests Unitaires
```typescript
describe('[ComponentName]', () => {
  // Structure des tests
});
```

### Tests d'Intégration
- Scénario 1: [Description]
- Scénario 2: [Description]

### Tests E2E
- Flow utilisateur principal
- Cas d'erreur

## 🔒 Sécurité
- [ ] Validation des entrées
- [ ] Protection CSRF
- [ ] Sanitization des données
- [ ] Gestion des permissions

## ⚡ Performance
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Cache strategy
- [ ] Bundle optimization

## ♿ Accessibilité
- [ ] Navigation clavier
- [ ] Attributs ARIA
- [ ] Contraste 4.5:1
- [ ] Screen reader support

## 🌍 Internationalisation
- [ ] Extraction des textes
- [ ] Traductions FR, EN, ES, IT
- [ ] Format des dates/nombres

## 🔗 Dépendances
- Modules internes: [Liste]
- Packages npm: [Liste]
- APIs externes: [Liste]

## ⚠️ Points d'Attention
1. [Point critique 1]
2. [Point critique 2]

## ✅ Definition of Done
- [ ] Code review approuvée
- [ ] Tests > 80% coverage
- [ ] Documentation complète
- [ ] Pas de dette technique
- [ ] Performance validée
- [ ] Accessibilité validée
- [ ] Traductions complètes
```

### 🎨 Phase 4: Affichage du Plan

1. Affiche le plan complet formaté en Markdown
2. Mets en évidence les points critiques avec des emojis
3. Utilise des tableaux pour les métriques
4. Inclus des exemples de code si pertinent

### ⏸️ Point d'Arrêt

**IMPORTANT**: Après avoir affiché le plan, ajoute ce message:

```
============================================
📋 PLAN GÉNÉRÉ - VALIDATION REQUISE
============================================

Le plan de développement a été créé avec succès.

Pour continuer avec l'implémentation :
1. Validez ce plan ou demandez des ajustements
2. Lancez: /project:execute-plan [numéro-issue]

Le plan sera sauvegardé dans:
docs/plans/UC-[X.Y]-plan.md
============================================
```

## Standards à Respecter

- TypeScript strict mode activé
- Interfaces plutôt que types
- JSDoc pour toutes les fonctions publiques
- Commits conventionnels (feat, fix, docs, etc.)
- Branches: feature/UC-[X.Y]-[description]
- Coverage tests > 80%
- Lighthouse > 80
- WCAG 2.1 AA

## Références

Utilise les documents suivants comme base:
- CDC MainHub.txt : Cahier des charges détaillé
- UC-LIST.txt : Liste complète des User Stories
- guideUC.txt : Guide de création des issues