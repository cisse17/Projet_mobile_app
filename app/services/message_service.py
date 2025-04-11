from sqlalchemy.orm import Session
from datetime import datetime
from app.models import models
from app.schemas import schemas
from app.websocket.manager import manager
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class MessageService:
    def __init__(self, db: Session):
        self.db = db

    async def create_message(self, sender_id: int, message_data: schemas.MessageCreate) -> models.Message:
        """Crée et envoie un nouveau message"""
        try:
            # Vérifier si le destinataire existe
            receiver = self.db.query(models.User).filter(models.User.id == message_data.receiver_id).first()
            if not receiver:
                raise HTTPException(status_code=404, detail="Destinataire non trouvé")

            # Créer le message
            db_message = models.Message(
                content=message_data.content,
                created_at=datetime.utcnow(),
                sender_id=sender_id,
                receiver_id=message_data.receiver_id,
                is_read=False
            )
            
            # Sauvegarder dans la base de données
            self.db.add(db_message)
            self.db.commit()
            self.db.refresh(db_message)

            # Préparer les données pour WebSocket
            message_data = {
                "type": "new_message",
                "message": {
                    "id": db_message.id,
                    "content": db_message.content,
                    "created_at": db_message.created_at.isoformat(),
                    "sender_id": db_message.sender_id,
                    "receiver_id": db_message.receiver_id,
                    "is_read": db_message.is_read
                }
            }

            # Envoyer via WebSocket
            await manager.send_personal_message(message_data, db_message.receiver_id)
            
            return db_message

        except Exception as e:
            self.db.rollback()
            logger.error(f"Erreur lors de la création du message: {str(e)}")
            raise

    def get_received_messages(self, user_id: int, skip: int = 0, limit: int = 100):
        """Récupère les messages reçus par un utilisateur"""
        try:
            # Récupérer les messages
            messages = self.db.query(models.Message)\
                .filter(models.Message.receiver_id == user_id)\
                .order_by(models.Message.created_at.desc())\
                .offset(skip)\
                .limit(limit)\
                .all()

            # Convertir les messages en dictionnaires
            return [message.to_dict() for message in messages]

        except Exception as e:
            logger.error(f"Erreur lors de la récupération des messages reçus: {str(e)}")
            raise

    def get_sent_messages(self, user_id: int, skip: int = 0, limit: int = 100):
        """Récupère les messages envoyés par un utilisateur"""
        try:
            return self.db.query(models.Message)\
                .filter(models.Message.sender_id == user_id)\
                .order_by(models.Message.created_at.desc())\
                .offset(skip)\
                .limit(limit)\
                .all()
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des messages envoyés: {str(e)}")
            raise

    async def mark_as_read(self, message_id: int, user_id: int):
        """Marque un message comme lu"""
        try:
            message = self.db.query(models.Message)\
                .filter(
                    models.Message.id == message_id,
                    models.Message.receiver_id == user_id
                )\
                .first()

            if not message:
                raise HTTPException(status_code=404, detail="Message non trouvé")

            message.is_read = True
            self.db.commit()

            # Notifier l'expéditeur via WebSocket que le message a été lu
            notification = {
                "type": "message_read",
                "message_id": message_id,
                "reader_id": user_id
            }
            await manager.send_personal_message(notification, message.sender_id)

            return message

        except Exception as e:
            self.db.rollback()
            logger.error(f"Erreur lors du marquage du message comme lu: {str(e)}")
            raise

    def get_conversation(self, user1_id: int, user2_id: int, skip: int = 0, limit: int = 100):
        """Récupère la conversation entre deux utilisateurs"""
        try:
            messages = self.db.query(models.Message)\
                .filter(
                    (
                        (models.Message.sender_id == user1_id) & 
                        (models.Message.receiver_id == user2_id)
                    ) |
                    (
                        (models.Message.sender_id == user2_id) & 
                        (models.Message.receiver_id == user1_id)
                    )
                )\
                .order_by(models.Message.created_at.desc())\
                .offset(skip)\
                .limit(limit)\
                .all()
            return messages
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de la conversation: {str(e)}")
            raise 