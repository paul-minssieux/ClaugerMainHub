# 🧪 Guide de Test - Orchestrateur Piral ClaugerMainHub

## 🚀 Démarrage Rapide

### 1. Lancer l'application

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur **http://localhost:5173** (ou un autre port si celui-ci est occupé)

## ✅ Points à Tester

### 1. **Page d'Accueil**
- ✅ L'application démarre sans erreurs
- ✅ Le layout principal s'affiche avec sidebar (desktop) ou hamburger menu (mobile)
- ✅ La page affiche "Bienvenue sur ClaugerMainHub"

### 2. **Service Worker (Mode Offline)**
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet **Application** > **Service Workers**
3. Vérifier que le Service Worker est **activé** ✅
4. Tester le mode offline :
   - Cocher "Offline" dans les DevTools
   - Rafraîchir la page
   - Vous devriez voir la **page offline élégante** 🌐

### 3. **Cache Manager (IndexedDB)**
1. Dans DevTools > **Application** > **IndexedDB**
2. Chercher la base "ClaugerMainHub"
3. Vérifier que le store "pilets" existe
4. Les pilets seront cachés ici une fois chargés

### 4. **Instance Piral**
1. Ouvrir la **Console** (F12)
2. Vous devriez voir :
   ```
   🚀 ClaugerMainHub Piral Instance initialized
   ```
3. Taper dans la console :
   ```javascript
   window.dbg.instance
   ```
   Cela affichera l'instance Piral configurée

### 5. **APIs Disponibles**
Dans la console, explorez les APIs :
```javascript
// Voir l'instance
window.dbg.instance

// Tester une notification (si l'API est exposée)
window.dbg.instance.showNotification({
  title: "Test",
  message: "Notification de test",
  type: "info"
})
```

### 6. **Responsive Design**
1. **Desktop** : Sidebar fixe à gauche
2. **Mobile** : 
   - Réduire la fenêtre (< 768px)
   - Le hamburger menu devrait apparaître
   - Cliquer pour ouvrir/fermer la sidebar

### 7. **Erreurs et Loading States**
1. Pour tester l'erreur 404 :
   - Naviguer vers `/nonexistent`
   - La page 404 devrait s'afficher

2. Pour voir le loading indicator :
   - Le spinner apparaît pendant le chargement des modules

## 🔍 Vérifications Avancées

### Console Browser
Vérifiez l'absence d'erreurs critiques :
- ❌ Erreurs rouges bloquantes
- ⚠️ Warnings acceptables en dev
- ✅ Messages de log informatifs

### Performance
1. Ouvrir l'onglet **Network**
2. Rafraîchir la page
3. Vérifier :
   - Bundle principal < 1MB
   - Temps de chargement < 3s
   - Service Worker intercepte les requêtes

### Accessibilité
1. Installer l'extension **axe DevTools**
2. Scanner la page
3. Vérifier : 0 violations critiques

## 🐛 Problèmes Connus

1. **Feed Service** : Pas de backend réel, utilise des mocks
2. **Bundle Size** : ~616KB (objectif < 300KB)
3. **Tests** : Coverage à ~20% (objectif > 80%)

## 📝 Commandes Utiles

```bash
# Lancer les tests
npm test

# Build de production
npm run build

# Analyser le bundle
npm run build -- --analyze

# Vérifier les types
npm run type-check

# Linter
npm run lint
```

## 🎯 Scénarios de Test

### Scénario 1 : Mode Offline
1. Charger la page normalement
2. Activer le mode offline dans DevTools
3. Naviguer dans l'app
4. Vérifier que le cache fonctionne
5. Désactiver offline et vérifier la reconnexion

### Scénario 2 : Cache Persistence
1. Charger la page
2. Fermer le navigateur
3. Rouvrir et vérifier que le cache est persistant
4. IndexedDB devrait contenir les données

### Scénario 3 : Responsive
1. Tester sur différentes tailles :
   - Mobile : 375px
   - Tablet : 768px
   - Desktop : 1920px
2. Vérifier l'adaptation du layout

## 📊 Métriques Attendues

| Métrique | Valeur Actuelle | Objectif |
|----------|-----------------|----------|
| Build Success | ✅ | ✅ |
| Service Worker | ✅ Active | ✅ |
| Cache Manager | ✅ Fonctionnel | ✅ |
| Mode Offline | ✅ Page dédiée | ✅ |
| Bundle Size | ⚠️ 616KB | < 300KB |
| Tests Coverage | ❌ 20% | > 80% |

## 🆘 Dépannage

### L'app ne démarre pas
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Service Worker ne s'active pas
- Vérifier HTTPS ou localhost
- Clear storage dans DevTools
- Unregister puis rafraîchir

### Erreurs TypeScript
```bash
# Vérifier sans les libs externes
npx tsc --noEmit --skipLibCheck
```

---

**Instance Piral fonctionnelle à 75%** - Prête pour recevoir des pilets ! 🚀