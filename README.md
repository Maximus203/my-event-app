# My Event

**Application web moderne de gestion d'événements** 

[![GitHub](https://img.shields.io/badge/GitHub-my--event--app-blue?logo=github)](https://github.com/Maximus203/my-event-app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)

![Bannière My Event](/assets/banner.png)

## Vidéo de démonstration

[Voir la démonstration complète](./démo.mp4)

## Description

My Event est une application web complète permettant la création, la gestion et la participation à des événements. Développée avec des technologies modernes, elle offre une expérience utilisateur fluide et intuitive pour les organisateurs d'événements et les participants.

## Fonctionnalités

### Gestion des événements
- ✅ **Création d'événements** avec détails complets (titre, description, date, lieu, participants max)
- ✅ **Modification et suppression** d'événements par le créateur
- ✅ **Publication/dépublication** d'événements
- ✅ **Duplication d'événements** existants
- ✅ **Gestion des participants** avec liste détaillée

### Système d'inscription
- ✅ **Inscription par email** (pour utilisateurs connectés et non connectés)
- ✅ **Rappels automatiques** 24h avant l'événement
- ✅ **Limitation du nombre de participants**

### Authentification et profil
- ✅ **Inscription et connexion** sécurisée avec JWT
- ✅ **Gestion du profil utilisateur** (nom, email, photo de profil)
- ✅ **Upload d'avatar**
- ✅ **Sécurité** avec hashage des mots de passe

### Interface utilisateur
- ✅ **Design moderne et responsive** avec Tailwind CSS
- ✅ **Mode sombre/clair** automatique
- ✅ **Animations fluides** avec Framer Motion

### Gestion des données
- ✅ **Base de données SQLite** avec TypeORM
- ✅ **Validation des données** côté backend et frontend
- ✅ **Gestion d'erreurs** complète
- ✅ **Logging** des activités

## Technologies utilisées

### Backend
- **Node.js** avec **Express** - Framework web
- **TypeScript** - Langage de programmation typé
- **TypeORM** - ORM pour la base de données
- **SQLite** - Base de données
- **JWT** - Authentification
- **bcryptjs** - Hashage des mots de passe
- **Multer** - Upload de fichiers
- **Nodemailer** - Envoi d'emails
- **class-validator** - Validation des données
- **node-cron** - Tâches programmées

### Frontend
- **React 19** - Bibliothèque UI
- **TypeScript** - Langage de programmation typé
- **Vite** - Bundler et serveur de développement
- **Tailwind CSS** - Framework CSS
- **Framer Motion** - Animations
- **React Router** - Routage
- **Axios** - Client HTTP
- **React Hot Toast** - Notifications
- **Lucide React** - Icônes

## Installation

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/Maximus203/my-event-app.git
cd my-event-app
```

2. **Installation du backend**
```bash
cd backend
npm install
```

3. **Configuration du backend**
```bash
# Copier le fichier d'exemple et le personnaliser
cp .env.example .env

# Éditer le fichier .env avec vos paramètres
# PORT=5000
# DB_PATH=./database.sqlite
# JWT_SECRET=VotreSecretJWT
# EMAIL_HOST=VotreServeurSMTP
# EMAIL_PORT=465
# EMAIL_USER=VotreEmail
# EMAIL_PASS=VotreMotDePasseEmail
```

4. **Installation du frontend**
```bash
cd ../frontend
npm install
```

> **Note**: Le frontend utilise un fichier `.env` qui est déjà configuré et ne contient aucune donnée sensible.

5. **Lancement de l'application**

Backend (dans le dossier `backend`) :
```bash
npm run dev
```

Frontend (dans le dossier `frontend`) :
```bash
npm run dev
```

L'application sera accessible à l'adresse : `http://localhost:3000`
L'API backend sera disponible à l'adresse : `http://localhost:5000`

## Structure du projet

```
my-event-app/
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── controllers/  # Contrôleurs API
│   │   ├── services/     # Logique métier
│   │   ├── entities/     # Modèles TypeORM
│   │   ├── repositories/ # Accès aux données
│   │   ├── middlewares/  # Middlewares Express
│   │   ├── routes/       # Routes API
│   │   ├── dtos/         # Objets de transfert de données
│   │   └── utils/        # Utilitaires
│   ├── uploads/          # Fichiers uploadés
│   └── database.sqlite   # Base de données
├── frontend/             # Application React
│   ├── src/
│   │   ├── components/   # Composants React
│   │   ├── pages/        # Pages de l'application
│   │   ├── services/     # Services API
│   │   ├── hooks/        # Hooks personnalisés
│   │   ├── contexts/     # Contextes React
│   │   └── types/        # Types TypeScript
│   └── public/           # Fichiers statiques
└── assets/               # Assets partagés
```

## Contribution

Les contributions sont les bienvenues ! Voici comment procéder :

1. **Fork** le projet
2. **Créer** une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commiter** vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. **Push** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Ouvrir** une Pull Request

### Standards de développement
- Utiliser TypeScript pour tout nouveau code
- Suivre les conventions de nommage établies
- Maintenir la couverture de code
- Documenter les nouvelles API

## Fonctionnalités en développement

### Priorité haute
- [ ] **Système de commentaires** sur les événements
- [ ] **Système de likes/favoris** pour les événements
- [ ] **Partage social** d'événements
- [ ] **Notifications en temps réel** (WebSockets)
- [ ] **Système de catégories** d'événements
- [ ] **Recherche avancée** avec géolocalisation
- [ ] **Upload de médias** (images de bannière, photos, vidéos)
- [ ] **Emails de confirmation** automatiques
- [ ] **Système de notifications** toast
- [ ] **Recherche et filtres** avancés
- [ ] **Dashboard** pour les organisateurs

### Priorité moyenne
- [ ] **Statistiques avancées** pour les organisateurs
- [ ] **Export des participants** (CSV, Excel)
- [ ] **Système de paiement** pour événements payants
- [ ] **API publique** avec documentation
- [ ] **Intégration calendrier** (Google Calendar, Outlook)
- [ ] **Système de révision** d'événements

### Priorité basse
- [ ] **Application mobile** (React Native)
- [ ] **Système de messagerie** entre participants
- [ ] **Recommandations d'événements** basées sur l'IA
- [ ] **Support multilingue** complet
- [ ] **Intégration réseaux sociaux** (Facebook, LinkedIn)
- [ ] **Système de badges** et gamification

### Améliorations techniques
- [ ] **Tests automatisés** (Jest, Cypress)
- [ ] **CI/CD** avec GitHub Actions
- [ ] **Documentation API** avec Swagger
- [ ] **Monitoring** et métriques
- [ ] **Cache Redis** pour les performances
- [ ] **Migration vers PostgreSQL** pour la production

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Auteur

**Maximus203** - [GitHub](https://github.com/Maximus203)

---

⭐ N'hésitez pas à donner une étoile au projet si vous le trouvez utile !
