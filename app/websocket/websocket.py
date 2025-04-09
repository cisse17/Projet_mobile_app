from fastapi import APIRouter, WebSocket, Depends, WebSocketDisconnect
from app.websocket.manager import manager
from app.utils.utils import get_current_user
from app.models import models
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()

@router.websocket("/ws/{token}")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str,
    db: Session = Depends(get_db)
):
    try:
        # Vérifier l'authentification
        user = await get_current_user(token, db)
        if not user:
            await websocket.close(code=4001)
            return

        # Accepter la connexion
        await manager.connect(websocket, user.id)

        try:
            while True:
                # Attendre des messages du client
                data = await websocket.receive_json()
                # Ici, vous pouvez ajouter une logique pour traiter les messages entrants
                # Par exemple, pour les messages de chat en direct
                
        except WebSocketDisconnect:
            manager.disconnect(websocket, user.id)
            
    except Exception as e:
        await websocket.close(code=4000) 