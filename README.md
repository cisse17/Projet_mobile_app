# API d'Authentification et Gestion des Utilisateurs

Cette API permet la gestion des utilisateurs et des événements avec des fonctionnalités d'authentification et de récupération des données.

## Prérequis

- Python 3.8+
- PostgreSQL
- Docker (optionnel)

## Installation

1. Clonez le repository
```bash
git clone [URL_DU_REPO]
cd [NOM_DU_PROJET]
```

2. Installez les dépendances
```bash
pip install -r requirements.txt
```

3. Configurez les variables d'environnement
Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

4. Lancez l'application
```bash
uvicorn app.main:app --reload
```

## Documentation de l'API

### Authentification

#### Inscription (Register)
```http
POST /register
```

**Request Body:**
```json
{
    "username": "string",
    "email": "string",
    "password": "string"
}
```

**Response (200 OK):**
```json
{
    "id": "integer",
    "username": "string",
    "email": "string"
}
```

**Erreurs possibles:**
- 400 Bad Request: Email déjà utilisé

#### Connexion (Login)
```http
POST /login
```

**Request Body:**
```json
{
    "email": "string",
    "password": "string"
}
```

**Response (200 OK):**
```json
{
    "access_token": "string",
    "token_type": "bearer"
}
```

**Erreurs possibles:**
- 401 Unauthorized: Identifiants invalides

### Déconnexion
```http
POST /auth/logout
Authorization: Bearer <token>
```

### Récupérer les informations de l'utilisateur connecté
```http
GET /auth/me
Authorization: Bearer <token>
```

### Gestion des Utilisateurs

#### Récupérer tous les utilisateurs
```http
GET /users/
```

**Response (200 OK):**
```json
[
    {
        "id": "integer",
        "username": "string",
        "email": "string"
    },
    ...
]
```

#### Récupérer un utilisateur par ID
```http
GET /users/{user_id}
```

**Response (200 OK):**
```json
{
    "id": "integer",
    "username": "string",
    "email": "string"
}
```

**Erreurs possibles:**
- 404 Not Found: Utilisateur non trouvé

### Gestion des Événements

#### Créer un événement
```http
POST /events/
Authorization: Bearer votre_token_jwt
```

**Request Body:**
```json
{
    "title": "string (unique)",
    "description": "string",
    "date": "string (format: YYYY-MM-DDTHH:MM:SS)",
    "location": "string"
}
```

**Response (200 OK):**
```json
{
    "id": "integer",
    "title": "string",
    "description": "string",
    "date": "string",
    "location": "string",
    "organizer_id": "integer"
}
```

**Erreurs possibles:**
- 400 Bad Request: Un événement avec ce titre existe déjà
- 401 Unauthorized: Token JWT invalide ou manquant

#### Récupérer tous les événements
```http
GET /events/
```

**Response (200 OK):**
```json
[
    {
        "id": "integer",
        "title": "string",
        "description": "string",
        "date": "string",
        "location": "string",
        "organizer_id": "integer"
    },
    ...
]
```

#### Récupérer un événement par ID
```http
GET /events/{event_id}
```

**Response (200 OK):**
```json
{
    "id": "integer",
    "title": "string",
    "description": "string",
    "date": "string",
    "location": "string",
    "organizer_id": "integer"
}
```

**Erreurs possibles:**
- 404 Not Found: Événement non trouvé

## Messagerie

### Envoyer un message
```http
POST /messages/
Authorization: Bearer <token>
Content-Type: application/json

{
    "content": "Bonjour !",
    "receiver_id": 2
}
```

### Récupérer les messages reçus
```http
GET /messages/received?skip=0&limit=100
Authorization: Bearer <token>
```

### Récupérer les messages envoyés
```http
GET /messages/sent?skip=0&limit=100
Authorization: Bearer <token>
```

### Marquer un message comme lu
```http
PUT /messages/{message_id}/read
Authorization: Bearer <token>
```

## Messagerie en Temps Réel (WebSocket)

### Connexion WebSocket
```javascript
const socket = new WebSocket(`ws://your-api-url/ws/${token}`);

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'new_message') {
        // Traiter le nouveau message
        console.log('Nouveau message reçu:', data.message);
    }
};

socket.onclose = (event) => {
    console.log('Connexion WebSocket fermée:', event.code, event.reason);
};
```

### Format des Messages WebSocket
```json
{
    "type": "new_message",
    "message": {
        "id": 123,
        "content": "Bonjour !",
        "created_at": "2024-03-14T12:00:00Z",
        "sender_id": 1,
        "receiver_id": 2,
        "is_read": false
    }
}
```

## Structure du Projet

```
app/
├── database.py      # Configuration de la base de données
├── main.py         # Point d'entrée de l'application
├── models/         # Modèles de données
│   └── models.py   # Définition des modèles SQLAlchemy
├── routers/        # Routes de l'API
│   ├── auth.py     # Routes d'authentification
│   ├── users.py    # Routes de gestion des utilisateurs
│   └── events.py   # Routes de gestion des événements
├── schemas/        # Schémas Pydantic
│   ├── schemas.py  # Schémas de validation
│   └── user.py     # Schémas utilisateur
└── utils/          # Utilitaires
    └── utils.py    # Fonctions utilitaires
```

## Déploiement avec Docker

1. Construisez l'image Docker
```bash
docker build -t api-auth .
```

2. Lancez les conteneurs
```bash
docker-compose up -d
```

## Technologies Utilisées

- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Docker
- Uvicorn

## Sécurité

- Les mots de passe sont hachés avant d'être stockés
- Validation des emails
- Gestion des erreurs appropriée
- Protection contre les attaques par injection SQL
- Authentification JWT pour les routes protégées
- Titres d'événements uniques

## Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request 