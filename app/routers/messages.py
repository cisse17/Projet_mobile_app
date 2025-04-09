from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import models
from app.schemas import schemas
from app.utils import utils
from app.websocket.manager import manager

router = APIRouter(
    prefix="/messages",
    tags=["messages"]
)

@router.post("/", response_model=schemas.MessageResponse)
async def send_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    # Vérifier si le destinataire existe
    receiver = db.query(models.User).filter(models.User.id == message.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Destinataire non trouvé")
    
    # Créer le message
    db_message = models.Message(
        content=message.content,
        created_at=datetime.utcnow(),
        sender_id=current_user.id,
        receiver_id=message.receiver_id
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    # Envoyer le message via WebSocket
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
    
    # Envoyer au destinataire
    await manager.send_personal_message(message_data, message.receiver_id)
    
    return db_message

@router.get("/received", response_model=schemas.MessageListResponse)
def get_received_messages(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    # Récupérer les messages reçus
    messages = db.query(models.Message)\
        .filter(models.Message.receiver_id == current_user.id)\
        .order_by(models.Message.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    # Compter les messages non lus
    unread_count = db.query(models.Message)\
        .filter(
            models.Message.receiver_id == current_user.id,
            models.Message.is_read == False
        )\
        .count()
    
    return {
        "messages": messages,
        "total": len(messages),
        "unread": unread_count
    }

@router.get("/sent", response_model=List[schemas.MessageResponse])
def get_sent_messages(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    messages = db.query(models.Message)\
        .filter(models.Message.sender_id == current_user.id)\
        .order_by(models.Message.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return messages

@router.put("/{message_id}/read")
def mark_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    message = db.query(models.Message)\
        .filter(
            models.Message.id == message_id,
            models.Message.receiver_id == current_user.id
        )\
        .first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    
    message.is_read = True
    db.commit()
    return {"message": "Message marqué comme lu"} 