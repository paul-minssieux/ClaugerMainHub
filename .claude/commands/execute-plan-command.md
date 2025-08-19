---
allowed-tools: Bash(*), Edit(*), Write(*), Read(*), View(*)
description: Valide le plan et exécute le développement complet avec tests et optimisations
---

# 🚀 Exécution du Plan de Développement

## Arguments
Issue GitHub: #$ARGUMENTS

## Context
- Branche actuelle: !`git branch --show-current`
- État du projet: !`ls -la`

## Instructions

### ✅ Phase 0: Validation du Plan

1. Charge le plan depuis `docs/plans/UC-$ARGUMENTS-plan.md`
2. Affiche un résumé des tâches principales
3. Confirme que le plan a été validé par l'utilisateur

### 🛠️ Phase 1: Setup et Configuration

**Agent Principal**: `code-generator-agent.md`

1. **Créer la branche de développement**:
   ```bash
   git checkout -b feature/UC-$ARGUMENTS-[description-courte]
   ```

2. **Structure des dossiers**:
   - Créer l'arborescence selon le plan
   - Respecter la structure modulaire du projet
   ```
   src/modules/[module]/
   ├── components/
   ├── hooks/
   ├── services/
   ├── types/
   ├── utils/
   └── tests/
   ```

3. **Installation des dépendances**:
   ```bash
   npm install [packages-requis]
   npm install -D [dev-dependencies]
   ```

4. **Configuration TypeScript**:
   - Vérifier/ajuster tsconfig.json si nécessaire
   - Activer strict mode
   - Configurer les paths aliases

5. **Configuration ESLint/Prettier**:
   - Vérifier les règles existantes
   - Ajouter des règles spécifiques si nécessaire

### 💻 Phase 2: Développement Principal

**Agents**: `code-generator-agent.md` + `agent-architecte-claude-code.md`

1. **Création des Types et Interfaces**:
   ```typescript
   // Toujours utiliser interfaces plutôt que types
   interface UserProps {
     id: string;
     name: string;
   }
   ```

2. **Implémentation des Composants React**:
   - Composants fonctionnels avec hooks
   - Props typées strictement
   - JSDoc complet pour les fonctions publiques
   ```typescript
   /**
    * Description du composant
    * @param props - Props du composant
    * @returns React Element
    */
   export const ComponentName: React.FC<Props> = (props) => {
     // Implementation
   };
   ```

3. **Services et Logique Métier**:
   - Pattern Repository pour l'accès aux données
   - Services isolés et testables
   - Gestion d'erreur complète

4. **Gestion d'État**:
   - Redux Toolkit pour l'état global
   - React Query pour le cache API
   - Context API pour l'état local

5. **Intégration API**:
   - Validation avec Joi/Zod
   - Types générés depuis OpenAPI si disponible
   - Gestion des erreurs HTTP

### 🧪 Phase 3: Tests Complets

**Agent Principal**: `test-engineer-agent.md`

1. **Tests Unitaires** (Coverage > 80%):
   ```typescript
   describe('ComponentName', () => {
     describe('Initialization', () => {
       it('should render without errors', () => {
         // Test
       });
     });
     
     describe('User Interactions', () => {
       it('should handle click events', () => {
         // Test
       });
     });
     
     describe('Error Handling', () => {
       it('should display error message', () => {
         // Test
       });
     });
   });
   ```

2. **Tests d'Intégration**:
   - Tests des flux complets
   - Mocking des services externes
   - Validation des contrats d'API

3. **Tests E2E** (si applicable):
   ```typescript
   // Cypress ou Playwright
   describe('User Flow', () => {
     it('should complete main user journey', () => {
       // Test E2E
     });
   });
   ```

4. **Exécution et Rapport**:
   ```bash
   npm test
   npm run test:coverage
   npm run test:e2e
   ```

### ⚡ Phase 4: Optimisation et Qualité

#### 4.1 Performance (`performance-agent.md`)

1. **Analyse Bundle**:
   ```bash
   npm run build
   npm run analyze
   ```

2. **Optimisations**:
   - Code splitting au niveau des routes
   - Lazy loading des composants non critiques
   - Optimisation des images
   - Tree shaking des imports

3. **Métriques Lighthouse**:
   - Objectif: Score > 80
   - Performance
   - Accessibilité
   - Best Practices
   - SEO

4. **Monitoring**:
   - Ajout des logs Application Insights
   - Métriques de performance runtime

#### 4.2 Accessibilité (`accessibility-agent.md`)

1. **Validation WCAG 2.1 AA**:
   - Navigation clavier complète
   - Attributs ARIA appropriés
   - Contrastes conformes (4.5:1 texte, 3:1 large)
   
2. **Tests automatisés**:
   ```bash
   npm run test:a11y
   ```

3. **Support lecteurs d'écran**:
   - Labels descriptifs
   - Annonces des changements d'état
   - Structure sémantique HTML

#### 4.3 Sécurité (`security-agent.md`)

1. **Scan de vulnérabilités**:
   ```bash
   npm audit
   npm audit fix
   ```

2. **Vérifications**:
   - Pas de secrets dans le code
   - Validation des entrées utilisateur
   - Protection CSRF si applicable
   - Headers de sécurité

3. **Code Review Sécurité**:
   - Injection SQL/NoSQL
   - XSS
   - CSRF
   - Authentication bypass

### 📚 Phase 5: Documentation et i18n

#### 5.1 Documentation (`documentation-agent.md`)

1. **Documentation Technique**:
   - README.md du module
   - Architecture Decision Records (ADR)
   - Diagrammes si nécessaires

2. **Documentation API**:
   - OpenAPI/Swagger si applicable
   - Exemples de requêtes/réponses
   - Codes d'erreur

3. **JSDoc → Markdown**:
   ```bash
   npm run docs:generate
   ```

4. **Guide d'Utilisation**:
   - Exemples de code
   - Cas d'usage courants
   - Troubleshooting

#### 5.2 Internationalisation (`i18n-agent.md`)

1. **Extraction des Textes**:
   - Identifier tous les textes hardcodés
   - Créer les clés de traduction
   - Utiliser les fonctions i18n

2. **Fichiers de Traduction**:
   ```json
   // locales/fr.json
   {
     "module.component.title": "Titre en français",
     "module.component.description": "Description en français"
   }
   ```

3. **Langues supportées**:
   - 🇫🇷 Français (FR)
   - 🇬🇧 Anglais (EN)
   - 🇪🇸 Espagnol (ES)
   - 🇮🇹 Italien (IT)

4. **Validation**:
   - Vérifier la complétude des traductions
   - Tester le changement de langue
   - Vérifier les formats de dates/nombres

### 🔍 Phase 6: Revue Finale

**Agent Principal**: `code-review-agent.md`

1. **Quality Gates**:
   - [ ] Coverage > 80%
   - [ ] Lighthouse > 80
   - [ ] Pas de vulnérabilités critiques
   - [ ] ESLint sans erreurs
   - [ ] TypeScript sans erreurs
   - [ ] Tests passants

2. **Checklist Finale**:
   - [ ] Pas de console.log()
   - [ ] Pas de code commenté
   - [ ] Pas de TODO non résolus
   - [ ] Documentation à jour
   - [ ] Traductions complètes

3. **Rapport de Conformité**:
   ```markdown
   ## 📊 Rapport de Conformité - UC $ARGUMENTS
   
   ### ✅ Critères d'Acceptation
   - [x] Critère 1: [Status]
   - [x] Critère 2: [Status]
   
   ### 📈 Métriques
   - Coverage: XX%
   - Lighthouse: XX
   - Bundle Size: XXkB
   - Temps de chargement: XXms
   
   ### 🧪 Tests
   - Unitaires: XX passants
   - Intégration: XX passants
   - E2E: XX passants
   ```

### 💾 Phase 7: Sauvegarde et Commit

1. **Vérification Git**:
   ```bash
   git status
   git diff
   ```

2. **Formatage Final**:
   ```bash
   npm run prettier:write
   npm run lint:fix
   ```

3. **Message de Commit**:
   ```bash
   git add .
   git commit -m "feat(module): implement UC-$ARGUMENTS - [description courte]

   - Created [components]
   - Added [features]
   - Tests coverage: XX%
   - Lighthouse score: XX
   
   Closes #$ARGUMENTS"
   ```

4. **Affichage Final**:
   ```
   ============================================
   ✅ DÉVELOPPEMENT TERMINÉ
   ============================================
   
   UC-$ARGUMENTS implémentée avec succès!
   
   📊 Résultats:
   - Coverage: XX%
   - Lighthouse: XX
   - Tests: XX/XX passants
   - Traductions: 4/4 langues
   
   📝 Prochaines étapes:
   1. git push origin feature/UC-$ARGUMENTS-[description]
   2. Créer une Pull Request
   3. Demander une review
   
   Fichiers modifiés: XX
   Lignes ajoutées: +XXX
   Lignes supprimées: -XX
   ============================================
   ```

## Configuration CI/CD

**Agent**: `ci-cd-agent.md`

Si nécessaire, mettre à jour `.github/workflows/ci.yml`:
```yaml
- name: Test UC-$ARGUMENTS
  run: |
    npm test -- --testPathPattern=UC-$ARGUMENTS
    npm run test:e2e -- --spec=UC-$ARGUMENTS
```

## Gestion des Erreurs

Si une erreur survient à n'importe quelle phase:
1. Afficher l'erreur clairement
2. Proposer une solution
3. Permettre de reprendre après correction
4. Logger dans un fichier `logs/UC-$ARGUMENTS-errors.log`

## Standards Stricts

- **TypeScript**: Mode strict, pas d'any
- **Tests**: Coverage > 80% obligatoire
- **Performance**: Lighthouse > 80 obligatoire
- **Accessibilité**: WCAG 2.1 AA obligatoire
- **Documentation**: JSDoc complet obligatoire
- **i18n**: 4 langues obligatoires