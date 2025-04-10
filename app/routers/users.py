from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserResponse

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@router.get("/search", response_model=List[UserResponse])
async def search_users(
    query: Optional[str] = Query(
        default=None,
        min_length=1,
        max_length=100,
        description="Texte à rechercher dans les noms d'utilisateurs"
    ),
    db: Session = Depends(get_db)
):
    """
    Recherche des utilisateurs par leur nom d'utilisateur.
    Retourne une liste d'utilisateurs correspondant à la recherche.
    """
    try:
        if not query:
            return []

        search_query = f"%{query}%"
        users = db.query(User).filter(
            User.username.ilike(search_query)
        ).all()
        
        print(f"Recherche pour '{query}': {len(users)} résultats trouvés")
        return users

    except Exception as e:
        print(f"Erreur lors de la recherche: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la recherche: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user 