from fastapi import APIRouter, WebSocket, Depends, WebSocketDisconnect, HTTPException
from app.websocket.manager import manager
from app.utils.utils import get_current_user
from app.models import models
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.message_service import MessageService
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws/{token}")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str,
    db: Session = Depends(get_db)
):
    try:
        # Vérifier l'authentification
        logger.info(f"Tentative de connexion WebSocket avec token: {token[:10]}...")
        user = await get_current_user(token, db)
        if not user:
            logger.warning("Tentative de connexion WebSocket avec un token invalide")
            await websocket.close(code=4001)
            return

        logger.info(f"Utilisateur {user.id} authentifié avec succès")

        # Accepter la connexion
        await manager.connect(websocket, user.id)
        logger.info(f"Connexion WebSocket établie pour l'utilisateur {user.id}")

        # Service de messages
        message_service = MessageService(db)

        try:
            while True:
                # Attendre des messages du client
                try:
                    data = await websocket.receive_json()
                    logger.info(f"Message reçu de l'utilisateur {user.id}: {str(data)[:100]}")
                    
                    # Mettre à jour le timestamp du dernier ping
                    await manager.update_ping(websocket)
                    
                    # Traiter le message selon son type
                    if "type" in data:
                        if data["type"] == "ping":
                            # Répondre au ping
                            await websocket.send_json({"type": "pong"})
                            logger.info(f"Pong envoyé à l'utilisateur {user.id}")
                            
                        elif data["type"] == "message":
                            # Créer et envoyer un nouveau message
                            try:
                                message_data = schemas.MessageCreate(
                                    content=data["content"],
                                    receiver_id=data["receiver_id"]
                                )
                                new_message = await message_service.create_message(user.id, message_data)
                                
                                # Confirmer la réception
                                await websocket.send_json({
                                    "type": "message_sent",
                                    "message_id": new_message.id
                                })
                                logger.info(f"Message envoyé par l'utilisateur {user.id}")
                                
                            except Exception as e:
                                logger.error(f"Erreur lors de l'envoi du message: {str(e)}")
                                await websocket.send_json({
                                    "type": "error",
                                    "message": "Erreur lors de l'envoi du message"
                                })
                                
                        elif data["type"] == "mark_read":
                            # Marquer un message comme lu
                            try:
                                message_id = data["message_id"]
                                await message_service.mark_as_read(message_id, user.id)
                                
                                await websocket.send_json({
                                    "type": "message_marked_read",
                                    "message_id": message_id
                                })
                                logger.info(f"Message marqué comme lu par l'utilisateur {user.id}")
                                
                            except Exception as e:
                                logger.error(f"Erreur lors du marquage du message: {str(e)}")
                                await websocket.send_json({
                                    "type": "error",
                                    "message": "Erreur lors du marquage du message"
                                })
                                
                        elif data["type"] == "get_unread_count":
                            # Envoyer le nombre de messages non lus
                            await manager.send_unread_messages_count(user.id)
                            logger.info(f"Nombre de messages non lus envoyé à l'utilisateur {user.id}")
                            
                except json.JSONDecodeError:
                    logger.error(f"Message invalide reçu de l'utilisateur {user.id}")
                    await websocket.send_json({
                        "type": "error",
                        "message": "Format de message invalide"
                    })
                
        except WebSocketDisconnect:
            logger.info(f"Déconnexion WebSocket de l'utilisateur {user.id}")
            manager.disconnect(websocket, user.id)
            
    except Exception as e:
        logger.error(f"Erreur WebSocket: {str(e)}")
        try:
            await websocket.close(code=4000)
        except:
            pass  # La connexion peut déjà être fermée 