# Cahier des Charges Détaillé - ClaugerMainHub
## Plateforme d'Orchestration Micro-Frontend

### 1. Vue d'Ensemble du Projet

#### 1.1 Contexte et Objectifs

Le projet ClaugerMainHub vise à créer une plateforme centralisée permettant l'intégration et l'orchestration d'applications micro-frontend au sein de l'écosystème Clauger. Cette plateforme servira de point d'entrée unique pour l'ensemble des collaborateurs, offrant un accès unifié aux différentes applications métier tout en maintenant leur indépendance technique et fonctionnelle.

La solution doit répondre aux enjeux suivants de l'entreprise. Premièrement, elle centralisera l'accès aux applications tout en préservant leur autonomie de développement et de déploiement. Deuxièmement, elle permettra une personnalisation poussée de l'expérience utilisateur à travers des dashboards configurables et des widgets modulaires. Troisièmement, elle facilitera l'intégration progressive de nouvelles applications sans impact sur l'existant. Enfin, elle offrira aux équipes de développement citoyennes (CITIZEN_DEV) un environnement de test isolé pour valider leurs développements avant mise en production.

#### 1.2 Périmètre Fonctionnel

Le périmètre du projet couvre le développement complet du MainHub incluant son interface utilisateur, son système d'administration, ses mécanismes d'authentification et d'autorisation, ainsi que les interfaces de communication avec les micro-frontends. Il comprend également le système de gestion des dashboards et widgets, la marketplace associée, et les fonctionnalités de personnalisation utilisateur.

Les éléments explicitement exclus du périmètre sont le bus Kafka pour la synchronisation inter-services (qui fera l'objet d'un projet séparé), le développement des micro-frontends eux-mêmes (à l'exception des exemples de démonstration), et les systèmes externes comme Viva Engage qui seront uniquement intégrés via API.

#### 1.3 Utilisateurs Cibles et Rôles

Le système définit trois rôles principaux avec des permissions distinctes. Le rôle USER représente l'utilisateur standard ayant accès aux applications autorisées, pouvant créer et gérer ses propres dashboards, personnaliser ses favoris et paramètres, et utiliser les widgets disponibles dans la marketplace. Le rôle CITIZEN_DEV correspond au développeur citoyen qui possède toutes les permissions USER, peut déployer et tester des micro-frontends en mode isolé, visualiser ses applications en développement sans impact sur les autres utilisateurs, et demander la publication de ses développements aux administrateurs. Le rôle ADMIN représente l'administrateur système avec toutes les permissions USER, la gestion complète des applications et widgets, la configuration des catégories et du système, la validation et publication des développements CITIZEN_DEV, l'accès aux métriques et KPI système, ainsi que la gestion des utilisateurs et de leurs rôles.

### 2. Architecture Technique Détaillée

#### 2.1 Architecture Micro-Frontend

L'architecture s'appuiera sur le framework Single-spa ou Piral selon l'analyse comparative qui sera menée en phase de conception. Cette décision devra prendre en compte les critères de facilité d'intégration pour les équipes de développement, les performances de chargement et d'exécution, la compatibilité avec l'écosystème React privilégié, ainsi que la maturité et le support communautaire de la solution.

Le système de communication entre le MainHub et les micro-frontends s'articulera autour d'un contrat d'interface JavaScript clairement défini. Ce contrat exposera des méthodes pour la récupération des paramètres utilisateur (langue, format, unités), l'envoi de notifications temporaires ou persistantes, la mise à jour de l'URL pour la navigation, la récupération du token d'authentification, et l'accès aux métadonnées du contexte d'exécution. Les micro-frontends devront implémenter des points d'entrée standardisés pour leur montage et démontage, la réception des mises à jour de configuration, la gestion des changements de taille (pour les widgets), et la réponse aux événements système.

#### 2.2 Stack Technologique

Le MainHub sera développé en React 18+ avec TypeScript pour assurer une meilleure maintenabilité et robustesse du code. L'interface utilisateur s'appuiera sur Chakra UI pour les composants et le système de design, avec une personnalisation des thèmes pour respecter la charte graphique Clauger. La gestion d'état utilisera Redux Toolkit pour l'état global et React Query pour la gestion du cache et des requêtes API. Le routage sera assuré par React Router v6 avec support de la navigation imbriquée pour les micro-frontends.

Côté backend, l'API REST sera développée en Node.js avec Express ou Fastify selon les besoins de performance identifiés. La base de données PostgreSQL stockera les données structurées avec Prisma comme ORM pour faciliter les migrations et la maintenance. Redis sera utilisé pour le cache de session et les données temporaires. La validation des données s'appuiera sur Joi ou Zod pour garantir l'intégrité des échanges.

#### 2.3 Sécurité et Authentification

L'authentification en production s'appuiera sur Azure Entra ID via le protocole OAuth2 avec support des flow Authorization Code avec PKCE. Les tokens JWT seront utilisés pour maintenir la session avec un refresh token pour le renouvellement automatique. Un mode d'authentification basique sera disponible pour les environnements de développement avec une base utilisateurs locale et un système de mot de passe hashé en bcrypt.

La gestion des permissions implémentera un système RBAC (Role-Based Access Control) avec vérification des permissions au niveau du MainHub et transmission du contexte de sécurité aux micro-frontends. Chaque micro-frontend pourra implémenter ses propres règles de sécurité additionnelles basées sur le token transmis. Les ressources sensibles seront protégées par des middlewares de validation au niveau API.

### 3. Spécifications Fonctionnelles Détaillées

#### 3.1 Interface Utilisateur Principale

##### 3.1.1 Layout et Structure

L'interface adopteur un layout en deux zones avec une sidebar latérale gauche et une zone de contenu principale. La sidebar aura une largeur de base de 280 pixels en desktop, s'adaptant automatiquement entre 240 et 320 pixels selon le contenu. Elle sera masquable via un bouton toggle conservant un rail de 48 pixels avec les icônes principales. La zone de contenu occupera l'espace restant avec un minimum de 70% de la largeur totale de l'écran.

Le système responsive appliquera des breakpoints à 768px pour tablette et 1024px pour desktop. Sur mobile (moins de 768px), la sidebar se transformera en menu burger fullscreen avec overlay. Sur tablette (768-1024px), la sidebar sera masquée par défaut avec possibilité d'affichage en overlay. Sur desktop (plus de 1024px), la sidebar sera affichée par défaut en mode persistant.

##### 3.1.2 Composants de la Sidebar

L'en-tête de la sidebar affichera le titre du hub configurable par l'administrateur avec une longueur maximale de 30 caractères. Un trait horizontal de 3 pixels servira de séparateur visuel avec une couleur configurable via un color picker hexadécimal. La hauteur totale de l'en-tête sera fixée à 80 pixels incluant les marges.

La barre de recherche proposera un champ de saisie avec icône de recherche et placeholder multilingue. La recherche s'effectuera en temps réel avec un debounce de 300ms, insensible à la casse sur les titres des éléments. L'algorithme affichera les résultats correspondants avec leurs dossiers parents même si ces derniers ne correspondent pas à la recherche. Un bouton de réinitialisation apparaîtra dès la saisie du premier caractère. La hauteur du composant sera de 48 pixels avec des marges de 16 pixels.

La section Favoris sera rétractable via une icône chevron avec animation de rotation. L'état ouvert/fermé sera persisté par utilisateur dans le localStorage. L'organisation permettra jusqu'à 2 niveaux de dossiers avec une limite de 50 favoris au total par utilisateur. Le drag and drop utilisera la librairie react-beautiful-dnd avec aperçu visuel du déplacement et zone de drop mise en évidence. Le clic droit ouvrira un menu contextuel permettant de renommer, supprimer ou changer la couleur. La personnalisation des couleurs proposera une palette de 12 couleurs prédéfinies plus un sélecteur personnalisé. Chaque modification sera sauvegardée automatiquement via API avec un indicateur de sauvegarde.

La section Dashboards suivra la même logique que les Favoris avec en plus un bouton "Nouveau Dashboard" en haut de section et une option d'import/export via menu contextuel. La limite sera de 20 dashboards par utilisateur avec possibilité de duplication et de partage via export JSON.

La section Applications affichera toutes les applications disponibles selon les permissions de l'utilisateur. L'organisation hiérarchique permettra 3 niveaux de catégories maximum avec icônes Chakra UI pour chaque catégorie. Les couleurs des catégories seront définies par l'administrateur et appliquées à tous les utilisateurs. Le système affichera un badge "NEW" pendant 7 jours pour les nouvelles applications et un indicateur de statut (vert=disponible, orange=maintenance, rouge=indisponible).

Le pied de sidebar occupera une hauteur fixe de 120 pixels avec l'avatar utilisateur en 48x48 pixels (récupéré d'Entra ID ou initiales sur fond coloré). Le nom complet sera tronqué avec ellipsis si supérieur à 20 caractères. La barre d'actions affichera 5 icônes en 24x24 pixels avec tooltips au survol, incluant un badge de notification pour les messages non lus sur l'icône appropriée.

#### 3.2 Gestion des Applications Micro-Frontend

##### 3.2.1 Cycle de Vie d'une Application

Le chargement initial d'une application suivra une séquence précise. D'abord, l'affichage d'un spinner de chargement avec le logo de l'application si disponible. Ensuite, la vérification des permissions utilisateur avec redirection si accès non autorisé. Puis la récupération des métadonnées de l'application depuis l'API. Le téléchargement et l'initialisation du bundle JavaScript du micro-frontend suivront. Enfin, le montage du micro-frontend dans le conteneur DOM dédié avec passage du contexte (token, langue, paramètres).

La gestion des erreurs distinguera plusieurs cas. Pour une erreur réseau (code HTTP 5xx ou timeout), affichage d'une page d'erreur générique avec option de retry et notification automatique aux administrateurs. Pour une erreur d'autorisation (code HTTP 403), affichage d'un message spécifique avec redirection vers l'accueil après 5 secondes. Pour une erreur JavaScript dans le micro-frontend, isolation de l'erreur avec affichage d'un message et maintien du MainHub fonctionnel, plus logging détaillé dans Application Insights.

La persistance de l'état maintiendra l'application en mémoire lors de la navigation entre menus. L'état sera conservé dans un Map JavaScript avec la clé étant l'ID de l'application. La limite sera de 5 applications simultanément en mémoire (configurable) avec éviction LRU (Least Recently Used) si dépassement. Le nettoyage complet s'effectuera à la fermeture de l'onglet ou après 30 minutes d'inactivité.

##### 3.2.2 Communication MainHub-MicroFrontend

L'API JavaScript exposée aux micro-frontends comprendra plusieurs méthodes essentielles. La méthode getCurrentUser() retournera les informations utilisateur sans données sensibles. La méthode getConfiguration() fournira langue, fuseau horaire, formats et unités préférées. La méthode getAuthToken() permettra de récupérer le token JWT avec vérification de validité. La méthode sendNotification(type, message, duration) enverra des notifications avec type 'temporary' (15 secondes) ou 'persistent'. La méthode updateUrl(path) mettra à jour la partie micro-frontend de l'URL. La méthode requestFullscreen() et exitFullscreen() géreront le mode plein écran. Enfin, la méthode logError(error, context) centralisera le logging des erreurs.

Le système d'événements permettra aux micro-frontends de s'abonner à des changements. L'événement 'languageChanged' se déclenchera lors du changement de langue utilisateur. L'événement 'themeChanged' notifiera le passage dark/light mode. L'événement 'userPreferencesUpdated' signalera les modifications de paramètres. L'événement 'beforeUnload' préviendra avant le démontage du micro-frontend. L'événement 'resize' informera des changements de taille du conteneur.

#### 3.3 Système de Dashboards et Widgets

##### 3.3.1 Dashboards Utilisateur

La création d'un nouveau dashboard demandera un nom unique par utilisateur de 50 caractères maximum et une description optionnelle de 200 caractères. Une icône pourra être sélectionnée parmi 20 options prédéfinies avec une couleur de thème parmi 8 options. Le dashboard pourra être défini comme favori (épinglé en haut de liste) et comme dashboard par défaut au login.

Le système de grille utilisera CSS Grid avec une configuration responsive. Sur mobile (moins de 768px), 2 colonnes de base seront disponibles. Sur tablette (768-1024px), 4 colonnes, et sur desktop (plus de 1024px), 6 colonnes. L'espacement entre widgets sera de 16 pixels constant avec une hauteur de ligne de base de 100 pixels. Les widgets pourront occuper 1 à 5 unités en largeur et hauteur avec un minimum de 1x1 et maximum de 5x5.

Le mode édition s'activera via un bouton "Modifier" en header avec changement visuel immédiat (bordures pointillées, fond légèrement grisé). Les actions disponibles incluront l'ajout de widgets via bouton "+" ouvrant la marketplace, le déplacement par drag and drop avec aperçu de la position finale, le redimensionnement via poignées aux coins (si supporté par le widget), la configuration via icône engrenage sur chaque widget, et la suppression via icône corbeille avec confirmation. La sauvegarde sera automatique à chaque modification avec possibilité d'annuler les 10 dernières actions.

##### 3.3.2 Configuration des Widgets

Chaque widget déclarera son schéma de configuration en JSON Schema v7 minimum. Le schéma définira les types de champs supportés (string, number, boolean, array, object), les validations nécessaires (required, min/max, pattern, enum), les valeurs par défaut pour chaque champ, les dépendances conditionnelles entre champs, et les messages d'aide et d'erreur multilingues.

La génération du formulaire utilisera @rjsf/core avec un thème Chakra UI personnalisé. Le formulaire supportera la validation en temps réel avec messages d'erreur contextuels, l'affichage conditionnel de champs selon les valeurs d'autres champs, les champs complexes comme color picker, date picker, file upload, la sauvegarde automatique en brouillon toutes les 30 secondes, et un bouton de réinitialisation aux valeurs par défaut.

La gestion de la rétrocompatibilité implémentera un versioning sémantique du schéma dans les métadonnées. Un système de migration automatique convertira les anciennes configurations avec fallback sur valeurs par défaut pour les nouveaux champs obligatoires et suppression silencieuse des champs obsolètes. Un log de migration sera conservé pour audit et la validation post-migration assurera l'intégrité des données.

##### 3.3.3 Marketplace de Widgets

L'interface de la marketplace s'ouvrira en modal plein écran avec overlay semi-transparent. La structure comprendra un header avec titre, barre de recherche et filtres, une grille de cartes widgets en disposition responsive, une pagination par scroll infini (20 widgets par chargement), et un panier latéral pour widgets sélectionnés avant ajout.

Chaque carte widget affichera un aperçu visuel (screenshot ou rendu live si léger), le titre et la description courte (100 caractères), la taille en unités (ex: 2x3), la catégorie et les tags associés, le nombre d'installations actives, la note moyenne et nombre d'avis (phase future), l'auteur et date de dernière mise à jour, ainsi qu'un badge "NEW" si ajouté depuis moins de 7 jours.

Les filtres disponibles permettront de trier par catégorie (multi-sélection), taille (cases à cocher par dimension), popularité (plus installés), nouveauté (plus récents), alphabétique, et recherche textuelle sur titre et description. Les filtres seront persistés dans l'URL pour partage et appliqués en temps réel avec indicateur de chargement.

Les actions sur les widgets incluront la prévisualisation en modal avec données de démonstration, l'ajout au panier avec confirmation visuelle, la consultation des détails complets en vue dédiée, et l'accès direct à la configuration si déjà installé. Un système de recommandation suggérera des widgets similaires ou complémentaires.

#### 3.4 Fonctionnalités d'Administration

##### 3.4.1 Tableau de Bord Administrateur

Le dashboard principal affichera des métriques clés en temps réel avec rafraîchissement automatique toutes les 30 secondes. Les KPI système incluront le nombre d'utilisateurs connectés actuellement et sur les dernières 24h, le nombre total d'applications, widgets et dashboards, le taux de disponibilité global du système, et le temps de réponse moyen des micro-frontends.

Les graphiques d'utilisation présenteront l'évolution du nombre d'utilisateurs actifs sur 30 jours, le top 10 des applications les plus utilisées, la répartition des utilisateurs par rôle, et l'activité par heure de la journée (heatmap). Tous les graphiques seront interactifs avec export possible en PNG ou CSV.

Le monitoring de santé affichera un statut en temps réel de chaque micro-frontend avec indicateur visuel (vert/orange/rouge), temps de réponse moyen sur la dernière heure, nombre d'erreurs sur les dernières 24h, et dernière vérification effectuée. Un bouton permettra de forcer une vérification immédiate avec historique des 100 dernières vérifications.

Le système d'alertes montrera les 50 dernières alertes critiques avec timestamp, source, message et statut de résolution. Les administrateurs pourront acquitter les alertes et ajouter des commentaires. Une configuration permettra de définir les seuils d'alerte et les destinataires des notifications email.

##### 3.4.2 Gestion des Applications

L'interface de gestion listera toutes les applications dans un tableau avec pagination (25 éléments par page). Les colonnes afficheront le nom, la catégorie, l'URL, le statut, le nombre d'utilisateurs, et les actions disponibles. Le tri sera possible sur toutes les colonnes avec recherche textuelle globale. Un export CSV de la liste complète sera disponible.

L'ajout et modification d'application se fera via formulaire modal avec les champs nom (requis, 100 caractères max), description (requis, 500 caractères), URL du micro-frontend (validation format URL et accessibilité), catégorie (sélection parmi existantes), icône (upload ou sélection bibliothèque), couleur thème (color picker), statut (Actif/Maintenance/Désactivé), rôles autorisés (multi-sélection), et métadonnées JSON libres (optionnel).

La validation technique vérifiera l'accessibilité de l'URL avec timeout de 10 secondes, le chargement correct du manifest.json du micro-frontend, la compatibilité de version avec le MainHub, et la non-duplication du nom ou de l'URL. Un mode test permettra de valider l'intégration avant activation.

Le système d'auto-découverte des widgets interrogera le point d'entrée /widgets du micro-frontend. Le format attendu sera un tableau JSON avec pour chaque widget son identifiant unique, nom et description, taille et contraintes, schéma de configuration, et URL de preview. L'import créera ou mettra à jour automatiquement les widgets avec notification des changements effectués.

##### 3.4.3 Gestion des Catégories

L'arborescence des catégories permettra 3 niveaux maximum de hiérarchie avec drag and drop pour réorganisation. Chaque catégorie aura un nom unique par niveau (50 caractères max), une icône sélectionnée depuis Chakra UI Icons, une couleur hexadécimale pour le texte, et un ordre d'affichage personnalisable.

Les contraintes de suppression empêcheront la suppression si des applications sont rattachées ou si des sous-catégories existent. Un déplacement automatique des éléments vers le parent sera proposé comme alternative. L'historique des modifications sera conservé pendant 30 jours.

##### 3.4.4 Gestion des Utilisateurs

La liste des utilisateurs affichera en tableau paginé (50 par page) les informations nom complet, email, rôle, dernière connexion, nombre de dashboards créés, nombre de widgets utilisés, et statut (Actif/Inactif). Les filtres permettront la recherche par nom/email, le filtrage par rôle, et par période de dernière activité.

La fiche détaillée utilisateur présentera les informations personnelles issues d'Entra ID, l'historique des connexions (30 derniers jours), la liste des dashboards créés avec possibilité de preview, les applications favorites et plus utilisées, ainsi que les paramètres personnalisés. Les actions administrateur incluront le changement de rôle, la réinitialisation des paramètres, l'export des données utilisateur (RGPD), et la désactivation du compte.

##### 3.4.5 Import/Export de Configuration

Le système supportera l'export en JSON de toutes les entités avec structure versionnée, inclusion optionnelle des relations, et chiffrement optionnel avec mot de passe. L'export pourra être global, par type d'entité, ou sélectif avec cases à cocher.

L'import proposera deux modes. Le mode "Fusion" ajoutera les nouveaux éléments et mettra à jour les existants par nom/ID avec détection des conflits et résolution manuelle. Le mode "Remplacement" effectuera une suppression complète avant import dans une transaction SQL unique avec rollback automatique en cas d'erreur.

La validation à l'import vérifiera la structure JSON contre le schéma attendu, la cohérence des relations entre entités, la compatibilité de version du format, et les permissions sur les entités à modifier. Un rapport détaillé sera généré avant confirmation avec preview des changements et estimation de l'impact.

#### 3.5 Système de Notifications

##### 3.5.1 Types de Notifications

Les notifications temporaires s'afficheront en toast en haut à droite de l'écran pendant 15 secondes par défaut (configurable 5-30 secondes). Elles seront utilisées pour les confirmations d'action, les messages d'information, et les avertissements non critiques. Le style visuel variera selon le type (success/info/warning/error) avec possibilité de fermeture manuelle anticipée.

Les notifications persistantes s'ajouteront au centre de notifications avec badge de compteur non-lu sur l'icône. Elles resteront jusqu'à acquittement manuel par l'utilisateur et pourront contenir des actions (boutons, liens). Un historique des 100 dernières notifications sera conservé avec possibilité de recherche et de filtrage par type ou source.

##### 3.5.2 Sources de Notifications

Les notifications système seront générées par le MainHub pour les maintenances planifiées, les nouvelles applications disponibles, les mises à jour de widgets, et les messages administrateur globaux. Les notifications applicatives proviendront des micro-frontends via l'API dédiée avec limitation de débit (10 par minute par application) et validation du format et contenu. Les notifications automatiques incluront les échecs de chargement, les erreurs de permission, les sessions expirées, et les sauvegardes automatiques réussies.

#### 3.6 Paramètres Utilisateur

##### 3.6.1 Préférences d'Affichage

Le choix de la langue proposera initialement Français, Anglais, Espagnol et Italien avec détection automatique basée sur le navigateur au premier login. Le changement sera immédiat avec rechargement des textes et notification aux micro-frontends pour adaptation. La préférence sera sauvegardée côté serveur et synchronisée entre appareils.

Le mode d'affichage permettra de choisir entre Clair, Sombre, et Automatique (selon l'OS). La transition utilisera une animation de fondu de 300ms avec persistance de la préférence par appareil dans le localStorage et synchronisation serveur pour nouveaux appareils.

##### 3.6.2 Préférences Régionales

Le fuseau horaire sera sélectionnable parmi la liste complète IANA avec recherche par ville ou pays. L'application automatique s'effectuera à tous les affichages de date/heure avec recalcul des timestamps pour les données historiques.

Les formats de date proposeront les options JJ/MM/AAAA (Europe), MM/JJ/AAAA (US), et AAAA-MM-JJ (ISO). Le séparateur sera configurable (/, -, .) avec preview en temps réel du format choisi.

Les formats de nombre permettront de choisir le séparateur décimal (. ou ,), le séparateur de milliers (espace, virgule, point), et le nombre de décimales par défaut (0-4). Les unités préférées basculeront entre Métrique (SI) et Impérial avec conversion automatique dans les affichages et transmission aux micro-frontends pour adaptation.

##### 3.6.3 Préférences de Démarrage

L'utilisateur pourra définir sa page d'accueil par défaut entre la page d'accueil standard, un dashboard spécifique, ou une application particulière. Le comportement à la connexion proposera d'ouvrir la page par défaut, de restaurer la dernière page visitée, ou d'afficher un écran de choix.

Les préférences de navigation permettront d'activer ou désactiver l'ouverture dans nouveaux onglets pour les liens externes, la confirmation avant fermeture avec travail non sauvegardé, le pré-chargement des applications favorites, et les animations de transition.

### 4. Exigences Non Fonctionnelles

#### 4.1 Performance

Le système devra supporter 500 utilisateurs simultanés en usage normal avec pics à 1000 utilisateurs lors d'événements spéciaux. Le temps de chargement initial du MainHub ne devra pas excéder 3 secondes sur connexion 4G standard. Le temps de bascule entre applications déjà chargées sera inférieur à 500ms. Le temps de réponse API moyen sera inférieur à 200ms pour 95% des requêtes.

L'optimisation utilisera le lazy loading pour les composants non critiques, le code splitting au niveau des routes principales, la mise en cache agressive des ressources statiques, la compression gzip/brotli pour tous les échanges, et le preloading intelligent basé sur les patterns d'usage.

#### 4.2 Sécurité

L'authentification implémentera OAuth2 avec Azure Entra ID et rotation automatique des tokens toutes les heures. Le refresh token aura une durée de vie de 7 jours avec renouvellement lors de l'utilisation. La déconnexion automatique s'effectuera après 8 heures d'inactivité avec avertissement à 7h30.

La protection des données appliquera le chiffrement TLS 1.3 minimum pour tous les échanges, le hashage bcrypt (coût 12) pour les mots de passe en mode dev, la sanitisation systématique des entrées utilisateur, et la protection CSRF sur toutes les actions de modification. Les logs ne contiendront aucune donnée personnelle identifiable avec anonymisation des IP et identifiants utilisateur.

#### 4.3 Disponibilité et Fiabilité

L'objectif de disponibilité sera de 99.5% en heures ouvrées (7h-20h) avec maintenance planifiée en dehors de ces créneaux. Le système de santé effectuera un health check toutes les 60 secondes de chaque micro-frontend avec retry automatique 3 fois avant marquage comme indisponible et notification administrateur si indisponible plus de 5 minutes.

La résilience implémentera une isolation des erreurs micro-frontend sans impact MainHub, un mode dégradé si services externes indisponibles, un circuit breaker sur les appels externes (seuil 50% erreur sur 10 requêtes), et une mise en cache de secours pour données critiques.

#### 4.4 Compatibilité

Le support navigateur couvrira Chrome 100+, Firefox 100+, Safari 15+, et Edge 100+ avec polyfills automatiques pour fonctionnalités manquantes et message d'avertissement pour navigateurs non supportés. Le responsive design s'adaptera aux tailles d'écran de 320px (iPhone SE) à 4K (3840px) avec breakpoints à 640px, 768px, 1024px, 1280px, et 1920px.

L'accessibilité respectera les guidelines WCAG 2.1 niveau AA minimum avec navigation complète au clavier, support des lecteurs d'écran (NVDA, JAWS, VoiceOver), contraste minimum 4.5:1 pour texte normal et 3:1 pour texte large, ainsi que des attributs ARIA appropriés sur tous les éléments interactifs.

### 5. Contraintes et Dépendances

#### 5.1 Contraintes Techniques

L'hébergement s'effectuera obligatoirement sur Azure (App Service ou AKS) avec utilisation d'Azure Entra ID pour l'authentification production et Application Insights pour monitoring. Les domaines autorisés seront limités à *.clauger.fr, *.clauger.com et Azure domains avec gestion CORS appropriée pour les sous-domaines.

Les limitations techniques incluront un maximum de 5 applications simultanément en mémoire par utilisateur, 20 dashboards par utilisateur avec 30 widgets maximum par dashboard, une taille maximale de 5x5 unités pour les widgets, et un timeout de 30 secondes pour le chargement des micro-frontends.

#### 5.2 Dépendances Externes

Le système dépendra d'Azure Entra ID pour l'authentification et les informations utilisateur, de Viva Engage pour les actualités entreprise (API REST), du système de notes de service (micro-frontend dédié), et du bus Kafka (futur) pour synchronisation inter-services.

Les dépendances de développement incluront Node.js 18+ et npm/yarn pour build et dépendances, PostgreSQL 14+ pour la base de données, Redis 6+ pour cache et sessions, et Docker pour containerisation et développement local.

### 6. Livrables et Planning

#### 6.1 Livrables Attendus

Les livrables de documentation comprendront le présent cahier des charges détaillé, les spécifications techniques détaillées, le guide d'installation et de déploiement, le manuel utilisateur avec captures d'écran, le guide développeur pour intégration micro-frontend, et la documentation API complète avec exemples.

Les livrables de code incluront le code source du MainHub avec tests unitaires (couverture >80%), un micro-frontend de démonstration avec widgets exemples, les scripts de déploiement et CI/CD, les scripts de migration de base de données, et les configurations Docker pour développement local.

Les livrables de formation comporteront une formation administrateur de 4 heures, une formation développeur micro-frontend de 8 heures, des vidéos tutorielles pour utilisateurs finaux (10 x 5 minutes), et un environnement de sandbox pour tests et formation.

#### 6.2 Critères d'Acceptation

Les critères fonctionnels valideront que toutes les user stories définies sont implémentées et testées, les 3 rôles utilisateur fonctionnent selon les spécifications, l'import/export de configuration fonctionne sans perte de données, la marketplace de widgets est opérationnelle avec au moins 5 widgets de démo, et le système de notifications fonctionne pour les deux types définis.

Les critères techniques exigeront des temps de réponse conformes aux exigences de performance, un taux de disponibilité de 99.5% sur période de test de 30 jours, aucune faille de sécurité critique identifiée lors de l'audit, une compatibilité validée sur tous les navigateurs cibles, et un score Lighthouse de 80+ sur les métriques principales.

Les critères de qualité imposeront une couverture de tests unitaires supérieure à 80%, aucun bug critique ou majeur en production, une dette technique évaluée à moins de 5 jours, une documentation complète et à jour, et un code respectant les standards de qualité définis (ESLint, Prettier).

### 7. Glossaire et Annexes

#### 7.1 Glossaire des Termes

**MainHub** désigne l'application principale orchestrant les micro-frontends. **Micro-frontend** représente une application web indépendante intégrée dans le MainHub. **Widget** est un composant réutilisable affichable dans un dashboard. **Dashboard** constitue un tableau de bord personnalisable composé de widgets. **Marketplace** est le catalogue de widgets et templates disponibles. **CITIZEN_DEV** définit le rôle de développeur citoyen testant ses développements. **Toast** est une notification temporaire affichée en surimpression. **JSON Schema** est le standard de définition de structure de données JSON. **Single-spa** est un framework d'orchestration de micro-frontends. **JWT** (JSON Web Token) est le format de token utilisé pour l'authentification. **RBAC** (Role-Based Access Control) est le système de gestion des permissions par rôle. **LRU** (Least Recently Used) est l'algorithme d'éviction du cache mémoire.

#### 7.2 Exemples de JSON

Les structures de données incluront notamment la configuration d'un widget avec son schéma JSON Schema définissant les propriétés, types et validations, ainsi que les valeurs de configuration spécifiques à une instance. L'export de dashboard contiendra les métadonnées du dashboard, la liste des widgets avec leurs positions et configurations, ainsi que les informations de version pour compatibilité. Le manifest d'un micro-frontend déclarera son nom, version, points d'entrée, widgets disponibles, et dépendances éventuelles.

Cette spécification détaillée servira de référence tout au long du projet, garantissant une compréhension commune des objectifs et des moyens pour les atteindre. Chaque section a été conçue pour éliminer les ambiguïtés et permettre une estimation précise des efforts de développement nécessaires.
