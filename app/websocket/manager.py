from typing import Dict, Set, Optional
from fastapi import WebSocket
import logging
import asyncio
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Dictionnaire pour stocker les connexions WebSocket par utilisateur
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        # Dictionnaire pour stocker le dernier ping de chaque connexion
        self.last_ping: Dict[WebSocket, datetime] = {}
        # Démarrer la tâche de nettoyage des connexions inactives
        asyncio.create_task(self._cleanup_inactive_connections())
        logger.info("ConnectionManager initialized")

    async def connect(self, websocket: WebSocket, user_id: int):
        """Établit une nouvelle connexion WebSocket"""
        try:
            logger.info(f"Tentative de connexion WebSocket pour l'utilisateur {user_id}")
            await websocket.accept()
            
            if user_id not in self.active_connections:
                self.active_connections[user_id] = set()
            self.active_connections[user_id].add(websocket)
            self.last_ping[websocket] = datetime.utcnow()
            
            logger.info(f"Connexion WebSocket établie pour l'utilisateur {user_id}")
            logger.info(f"Nombre total de connexions actives: {sum(len(conns) for conns in self.active_connections.values())}")
            logger.info(f"Utilisateurs connectés: {list(self.active_connections.keys())}")
            
            # Envoyer un message de bienvenue
            await websocket.send_json({
                "type": "connection_established",
                "message": "Connexion WebSocket établie avec succès"
            })
            
        except Exception as e:
            logger.error(f"Erreur lors de la connexion de l'utilisateur {user_id}: {str(e)}")
            raise

    def disconnect(self, websocket: WebSocket, user_id: int):
        """Déconnecte un WebSocket"""
        try:
            logger.info(f"Disconnecting user {user_id}")
            if user_id in self.active_connections:
                self.active_connections[user_id].remove(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
                if websocket in self.last_ping:
                    del self.last_ping[websocket]
                logger.info(f"User {user_id} disconnected. Active connections: {len(self.active_connections)}")
        except Exception as e:
            logger.error(f"Error disconnecting user {user_id}: {str(e)}")

    async def send_personal_message(self, message: dict, user_id: int):
        """Envoie un message à un utilisateur spécifique"""
        try:
            logger.info(f"Tentative d'envoi de message à l'utilisateur {user_id}")
            logger.info(f"Type de message: {message.get('type')}")
            
            if user_id in self.active_connections:
                connections = self.active_connections[user_id]
                logger.info(f"Nombre de connexions trouvées pour l'utilisateur {user_id}: {len(connections)}")
                
                failed_connections = set()
                success = False
                
                for connection in connections:
                    try:
                        await connection.send_json(message)
                        logger.info(f"Message envoyé avec succès à l'utilisateur {user_id}")
                        success = True
                    except Exception as e:
                        logger.error(f"Échec de l'envoi du message à une connexion de l'utilisateur {user_id}: {str(e)}")
                        failed_connections.add(connection)
                
                # Nettoyer les connexions échouées
                for failed in failed_connections:
                    self.active_connections[user_id].remove(failed)
                    if failed in self.last_ping:
                        del self.last_ping[failed]
                
                if not success:
                    logger.warning(f"Aucun message n'a pu être envoyé à l'utilisateur {user_id}")
                
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
                    logger.info(f"Toutes les connexions de l'utilisateur {user_id} ont été supprimées")
            else:
                logger.warning(f"Aucune connexion active trouvée pour l'utilisateur {user_id}")
                logger.info(f"Utilisateurs actuellement connectés: {list(self.active_connections.keys())}")
        except Exception as e:
            logger.error(f"Erreur générale lors de l'envoi du message: {str(e)}")

    async def broadcast(self, message: dict):
        """Diffuse un message à tous les utilisateurs connectés"""
        logger.info(f"Broadcasting message to {len(self.active_connections)} users")
        for user_id, connections in list(self.active_connections.items()):
            for connection in list(connections):
                try:
                    await connection.send_json(message)
                    logger.info(f"Broadcast successful to user {user_id}")
                except Exception as e:
                    logger.error(f"Error broadcasting to user {user_id}: {str(e)}")
                    connections.remove(connection)
                    if connection in self.last_ping:
                        del self.last_ping[connection]

    async def update_ping(self, websocket: WebSocket):
        """Met à jour le timestamp du dernier ping"""
        self.last_ping[websocket] = datetime.utcnow()

    async def _cleanup_inactive_connections(self):
        """Nettoie les connexions inactives"""
        while True:
            try:
                await asyncio.sleep(30)  # Vérifier toutes les 30 secondes
                now = datetime.utcnow()
                timeout = timedelta(minutes=5)  # Timeout après 5 minutes d'inactivité

                for user_id, connections in list(self.active_connections.items()):
                    for connection in list(connections):
                        last_ping = self.last_ping.get(connection)
                        if last_ping and (now - last_ping) > timeout:
                            logger.warning(f"Removing inactive connection for user {user_id}")
                            connections.remove(connection)
                            if connection in self.last_ping:
                                del self.last_ping[connection]
                    
                    if not connections:
                        del self.active_connections[user_id]

            except Exception as e:
                logger.error(f"Error in cleanup task: {str(e)}")

    async def send_unread_messages_count(self, user_id: int):
        """Envoie le nombre de messages non lus à l'utilisateur"""
        try:
            if user_id in self.active_connections:
                # Cette partie nécessite l'accès à la base de données
                # Vous devrez l'adapter selon votre configuration
                from app.database import get_db
                from app.models.models import Message
                
                db = next(get_db())
                unread_count = db.query(Message)\
                    .filter(Message.receiver_id == user_id, Message.is_read == False)\
                    .count()
                
                await self.send_personal_message({
                    "type": "unread_count",
                    "count": unread_count
                }, user_id)
        except Exception as e:
            logger.error(f"Error sending unread count to user {user_id}: {str(e)}")

manager = ConnectionManager() 