# from fastapi import FastAPI
# from app.database import Base, engine
# from app.routers import auth

# Base.metadata.create_all(bind=engine)

# app = FastAPI()
# app.include_router(auth.router)

# test
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import models
from app.routers import auth, users, events, messages
from app.websocket import websocket
import time

# Attendre que la base de données soit prête
time.sleep(5)  # Attendre 5 secondes

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MusicApp API",
    description="""
    API pour l'application MusicApp avec les fonctionnalités suivantes :
    
    * 🔐 **Authentification** : Inscription, connexion et déconnexion sécurisées
    * 👥 **Gestion des utilisateurs** : CRUD complet des utilisateurs
    * 🎉 **Gestion des événements** : Création et gestion des événements musicaux
    * 💬 **Messagerie** : Envoi et réception de messages entre utilisateurs
    * ⚡ **WebSocket** : Messagerie en temps réel
    
    ## Documentation
    
    * Swagger UI: [/docs](/docs)
    * ReDoc: [/redoc](/redoc)
    
    ## Authentification
    
    Pour utiliser l'API, vous devez d'abord vous authentifier :
    
    1. Créez un compte via `/auth/register`
    2. Connectez-vous via `/auth/login` pour obtenir un token JWT
    3. Utilisez le token dans le header `Authorization: Bearer <token>`
    4. Déconnectez-vous via `/auth/logout` quand vous avez terminé
    
    ## Exemples de requêtes
    
    ```bash
    # Connexion
    curl -X POST "http://localhost:8000/auth/login" -H "Content-Type: application/x-www-form-urlencoded" -d "username=test@example.com&password=password123"
    
    # Déconnexion
    curl -X POST "http://localhost:8000/auth/logout" -H "Authorization: Bearer <token>"
    ```
    """,
    version="1.0.0",
    contact={
        "name": "Support MusicApp",
        "email": "support@musicapp.com",
    },
    license_info={
        "name": "MIT",
    },
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,
        "docExpansion": "list",
        "filter": True,
        "persistAuthorization": True,
    }
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routeurs
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(events.router)
app.include_router(messages.router)
app.include_router(websocket.router)

@app.get("/", tags=["Documentation"])
async def root():
    """
    Point d'entrée de l'API.
    
    Retourne un message de bienvenue et des liens vers la documentation.
    
    Returns:
        dict: Message de bienvenue et liens vers la documentation
    """
    return {
        "message": "Bienvenue sur l'API MusicApp",
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc"
        }
    }
