# ClaugerMainHub Frontend

## 🚀 Architecture React/TypeScript avec Vite

### ✅ Configuration complète

- **React 18.3+** avec TypeScript 5.5+ en mode strict
- **Vite 5+** pour des builds ultra-rapides
- **Chakra UI** avec thème accessible WCAG 2.1 AA
- **Redux Toolkit** + React Query pour la gestion d'état
- **ESLint** + Prettier + Husky configurés
- **Vitest** pour les tests unitaires (>80% coverage)

### 🏗️ Structure du projet

```
src/
├── core/                   # Noyau architectural
│   ├── interfaces/        # Types et interfaces
│   ├── services/          # EventBus et services core
│   └── api/              # API pour micro-frontends
├── features/             # Modules métier
├── shared/               # Composants partagés
├── infrastructure/       # Couche infrastructure
├── security/             # CSP et XSS protection
├── accessibility/        # Gestion du focus et a11y
└── theme/               # Thème Chakra UI accessible
```

### 📦 Installation

```bash
npm install
```

### 🛠️ Commandes disponibles

```bash
# Développement
npm run dev              # Serveur de développement sur http://localhost:3000

# Build
npm run build           # Build de production
npm run preview        # Preview du build

# Tests
npm run test           # Tests en mode watch
npm run test:coverage  # Coverage report
npm run test:ui       # Interface Vitest

# Qualité
npm run lint          # ESLint
npm run type-check    # TypeScript check
npm run format        # Prettier
```

### 🔒 Sécurité

- **Content Security Policy (CSP)** configurée
- **Protection XSS** avec DOMPurify
- **Variables d'environnement** validées
- **Headers de sécurité** configurés

### ♿ Accessibilité

- **WCAG 2.1 niveau AA** respecté
- **Navigation clavier** complète
- **Skip links** et live regions
- **Contrastes** minimum 4.5:1
- **Focus management** avec FocusManager

### ⚡ Performance

- **Bundle size** < 200KB (objectif)
- **Code splitting** automatique
- **Lazy loading** des routes
- **Web Vitals** optimisés
- **Lighthouse score** > 90 (objectif)

### 🔌 API pour Micro-frontends

Le MainHub expose une API globale pour les micro-frontends :

```typescript
window.ClaugerMainHub = {
  getCurrentUser(),
  getConfiguration(),
  getAuthToken(),
  sendNotification(),
  updateUrl(),
  subscribe(),
  emit()
}
```

### 🌍 Internationalisation

Support prévu pour :
- 🇫🇷 Français
- 🇬🇧 Anglais
- 🇪🇸 Espagnol
- 🇮🇹 Italien

### 📊 Métriques de succès

- **Coverage tests** : > 80%
- **Lighthouse** : > 90
- **Bundle size** : < 200KB
- **TTI** : < 3s sur 4G
- **Build time** : < 10s

### 🤝 Contribution

1. Créer une branche `feature/UC-X.Y-description`
2. Commiter avec des messages conventionnels
3. Tests obligatoires (>80% coverage)
4. Code review par 2 reviewers minimum

### 📝 License

Propriétaire - Clauger 2025