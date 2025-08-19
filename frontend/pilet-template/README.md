# 📦 Template Pilet ClaugerMainHub

Ce template fournit une base pour créer des pilets (micro-frontends) pour ClaugerMainHub.

## 🚀 Démarrage rapide

### Créer un nouveau pilet

```bash
# Cloner le template
cp -r pilet-template mon-nouveau-pilet
cd mon-nouveau-pilet

# Installer les dépendances
npm install

# Démarrer en mode développement
npm start
```

### Structure du projet

```
mon-nouveau-pilet/
├── src/
│   ├── index.tsx        # Point d'entrée du pilet
│   ├── types.d.ts       # Types TypeScript
│   ├── components/      # Composants React
│   ├── services/        # Services et API
│   └── styles/          # Styles CSS/SCSS
├── package.json
├── tsconfig.json
└── piral-cli.config.js
```

## 📝 Développement

### API disponible

Le pilet a accès à l'API MainHub complète :

```typescript
export function setup(api: PiletApi) {
  // Authentification
  const user = await api.getCurrentUser()
  
  // Configuration
  const config = await api.getConfiguration()
  
  // Notifications
  api.sendNotification('success', 'Opération réussie')
  api.notifications.showError('Une erreur est survenue')
  
  // Widgets
  api.registerWidget({
    id: 'mon-widget',
    name: 'Mon Widget',
    component: MonWidget,
    defaultSize: { width: 2, height: 2 },
    permissions: ['USER']
  })
  
  // Événements
  api.subscribeToEvent('user:logout', () => {
    console.log('User logged out')
  })
  
  // EventBus direct
  api.eventBus.emit('custom:event', data)
}
```

### Enregistrer des composants

#### Page

```typescript
api.registerPage('/ma-page', () => <MaPage />)
```

#### Menu

```typescript
api.registerMenu({
  type: 'general',
  name: 'Mon Menu',
  href: '/ma-page',
  icon: '📄'
})
```

#### Widget Dashboard

```typescript
api.registerWidget({
  id: 'mon-widget',
  name: 'Mon Widget',
  component: MonWidget,
  defaultSize: { width: 2, height: 2 },
  permissions: ['USER']
})
```

#### Extension

```typescript
api.registerExtension('header-items', () => <MonExtension />)
```

### Utiliser Chakra UI

Tous les composants Chakra UI sont disponibles :

```tsx
import { Box, Button, Text, useToast } from '@chakra-ui/react'

const MonComposant = () => {
  const toast = useToast()
  
  return (
    <Box p={4}>
      <Text>Mon composant</Text>
      <Button onClick={() => toast({ title: 'Click!' })}>
        Cliquer
      </Button>
    </Box>
  )
}
```

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests avec couverture
npm run test:coverage
```

## 📦 Build et Publication

### Build local

```bash
npm run build
```

### Valider le pilet

```bash
npm run validate
```

### Publier sur le feed

```bash
# Configuration requise
export PILET_FEED_URL=https://feed.clauger.com/api/v1/pilets
export PILET_API_KEY=your-api-key

# Publier
npm run publish
```

## 🔒 Permissions

Les pilets peuvent être restreints par permissions :

```typescript
// Widget visible uniquement pour les admins
api.registerWidget({
  id: 'admin-widget',
  // ...
  permissions: ['ADMIN']
})
```

Niveaux de permission disponibles :
- `PUBLIC` : Accès public
- `USER` : Utilisateur connecté
- `MANAGER` : Manager
- `ADMIN` : Administrateur  
- `SUPER_ADMIN` : Super administrateur

## 🎨 Thèmes

Le pilet s'adapte automatiquement au thème de l'application :

```typescript
// Obtenir le thème actuel
const theme = api.theme.getCurrentTheme() // 'light' | 'dark' | 'auto'

// Changer le thème
api.theme.switchTheme('dark')

// Écouter les changements de thème
api.subscribeToEvent('theme:changed', ({ theme }) => {
  console.log('New theme:', theme)
})
```

## ♿ Accessibilité

Utilisez les helpers d'accessibilité :

```typescript
// Annoncer aux lecteurs d'écran
api.accessibility.announceMessage('Chargement terminé')

// Définir le focus
api.accessibility.setFocus('#mon-element')

// Piéger le focus dans une modale
const release = api.accessibility.trapFocus('.modal-container')
// Plus tard...
release()
```

## 📚 Ressources

- [Documentation Piral](https://docs.piral.io/)
- [Documentation Chakra UI](https://chakra-ui.com/)
- [Guide ClaugerMainHub](../docs/guides/pilet-development.md)

## 🤝 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement
- Consulter la documentation complète

---

*Template créé pour ClaugerMainHub - UC 1.2*