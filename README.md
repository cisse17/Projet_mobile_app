# Projet Mobile App - Plateforme de Musique

## 📋 Description
Une application mobile permettant aux musiciens de se connecter, partager des événements musicaux et communiquer entre eux. Le projet comprend un backend FastAPI et un frontend React Native.

## 🚀 Fonctionnalités Principales

### Authentification
- Inscription et connexion des utilisateurs
- Gestion des tokens JWT
- Profils utilisateurs personnalisables

### Événements Musicaux
- Création et gestion d'événements
- Recherche d'événements
- Participation aux événements
- Système de notation des événements

### Messagerie
- Chat en temps réel via WebSocket
- Messages privés entre utilisateurs
- Notifications en temps réel
- Marqueurs de lecture des messages

### Profils Utilisateurs
- Informations personnelles
- Instruments joués
- Historique des événements
- Système de notation

## 🛠️ Architecture Technique

### Backend (FastAPI)
- **Base de données**: PostgreSQL
- **Authentification**: JWT
- **WebSocket**: Communication en temps réel
- **API REST**: Endpoints pour toutes les fonctionnalités
- **Docker**: Containerisation de l'application

### Frontend (React Native)
- **Navigation**: React Navigation
- **État**: Gestion d'état avec hooks
- **API**: Axios pour les requêtes HTTP
- **WebSocket**: Communication en temps réel
- **Stockage**: AsyncStorage pour le stockage local

## 📦 Installation

### Prérequis
- Docker et Docker Compose
- Node.js et npm
- Python 3.8+

### Backend
```bash
# Installation des dépendances
pip install -r requirements.txt

# Configuration de l'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Lancer le serveur
uvicorn app.main:app --reload
```

### Frontend
```bash
# Installation des dépendances
cd frontend
npm install

# Configuration
# Éditer frontend/src/config/api.ts avec l'URL de votre API

# Lancer l'application
npm start
```

### Docker
```bash
# Lancer tous les services
docker-compose up -d
```

## 🔧 Configuration

### Variables d'Environnement
```env
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SECRET_KEY=votre_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend
API_URL=http://localhost:8000
```

## 📱 Fonctionnalités Détaillées

### Authentification
- Inscription avec email et mot de passe
- Connexion avec token JWT
- Récupération de mot de passe
- Gestion des sessions

### Événements
- Création d'événements avec titre, description, date
- Recherche par date, lieu, type d'événement
- Système de participation
- Notation et commentaires

### Messagerie
- Chat en temps réel
- Historique des conversations
- Notifications push
- Marqueurs de lecture

### Profils
- Informations personnelles
- Instruments joués
- Historique des événements
- Système de notation

## 🔒 Sécurité
- Authentification JWT
- Validation des données
- Protection CSRF
- Chiffrement des mots de passe

## 📊 Base de Données
- Utilisateurs
- Événements
- Messages
- Participations
- Notes

## 🚀 Déploiement
- Docker pour la containerisation
- Configuration pour production
- Variables d'environnement sécurisées
- Logs et monitoring

## 📚 Documentation API
La documentation de l'API est disponible à `/docs` une fois le serveur lancé.

## 🤝 Contribution
1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence
Ce projet est sous licence MIT.

## 👥 Auteurs
- [Bassirou Chef d'équipe]

## 🙏 Remerciements
- FastAPI
- React Native
- PostgreSQL
- Docker
