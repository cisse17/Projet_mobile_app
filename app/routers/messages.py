from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import models
from app.schemas import schemas
from app.utils import utils
from app.services.message_service import MessageService

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
    message_service = MessageService(db)
    return await message_service.create_message(current_user.id, message)

@router.get("/received", response_model=schemas.MessageListResponse)
def get_received_messages(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    message_service = MessageService(db)
    return message_service.get_received_messages(current_user.id, skip, limit)

@router.get("/sent", response_model=List[schemas.MessageResponse])
def get_sent_messages(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    message_service = MessageService(db)
    return message_service.get_sent_messages(current_user.id, skip, limit)

@router.put("/{message_id}/read")
async def mark_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    message_service = MessageService(db)
    await message_service.mark_as_read(message_id, current_user.id)
    return {"message": "Message marqué comme lu"}

@router.get("/conversation/{other_user_id}", response_model=List[schemas.MessageResponse])
def get_conversation(
    other_user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    message_service = MessageService(db)
    return message_service.get_conversation(current_user.id, other_user_id, skip, limit) 