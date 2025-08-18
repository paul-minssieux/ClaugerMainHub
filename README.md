# ClaugerMainHub

## Plateforme d'Orchestration Micro-Frontend

### Vue d'ensemble

ClaugerMainHub est une plateforme centralisée permettant l'intégration et l'orchestration d'applications micro-frontend au sein de l'écosystème Clauger. Cette plateforme sert de point d'entrée unique pour l'ensemble des collaborateurs, offrant un accès unifié aux différentes applications métier.

### Objectifs

- Centraliser l'accès aux applications tout en préservant leur autonomie
- Permettre une personnalisation poussée via des dashboards configurables et des widgets modulaires
- Faciliter l'intégration progressive de nouvelles applications
- Offrir aux équipes CITIZEN_DEV un environnement de test isolé

### Architecture Technique

- **Frontend**: React 18+ avec TypeScript, Chakra UI
- **Backend**: Node.js avec Express/Fastify, PostgreSQL, Redis
- **Orchestration**: Single-spa ou Piral (à déterminer)
- **Authentification**: Azure Entra ID (OAuth2)
- **Monitoring**: Application Insights

### Rôles Utilisateur

- **USER**: Utilisateur standard avec accès aux applications autorisées
- **CITIZEN_DEV**: Développeur citoyen avec environnement de test isolé
- **ADMIN**: Administrateur système avec gestion complète de la plateforme

### Structure du Projet

Le projet est organisé en 13 Epics principales avec leurs User Stories correspondantes :

1. **Infrastructure et Architecture de Base** (UC 1.1 - 1.10)
2. **Système d'Authentification et Sécurité** (UC 2.1 - 2.10)
3. **Layout Principal et Sidebar** (UC 3.1 - 3.15)
4. **Gestion des Applications Micro-Frontend** (UC 4.1 - 4.15)
5. **Système de Dashboards** (UC 5.1 - 5.15)
6. **Système de Widgets** (UC 6.1 - 6.10)
7. **Marketplace de Widgets** (UC 7.1 - 7.15)
8. **Interface Administration** (UC 8.1 - 8.15)
9. **Rôle CITIZEN_DEV** (UC 9.1 - 9.10)
10. **Système de Notifications** (UC 10.1 - 10.10)
11. **Paramètres Utilisateur** (UC 11.1 - 11.15)
12. **Performance et Optimisation** (UC 12.1 - 12.10)
13. **Accessibilité et Compatibilité** (UC 13.1 - 13.10)

### Documentation

- [Cahier des Charges Détaillé](./docs/CDC_MainHub.md)
- [Liste des User Stories](./docs/UC-LIST.md)
- [Guide d'Installation](./docs/INSTALL.md) _(à venir)_
- [Guide Développeur](./docs/DEVELOPER.md) _(à venir)_

### Contribution

Chaque User Story est trackée via les Issues GitHub avec les labels appropriés pour Epic, priorité et status.

### License

Propriétaire - Clauger
