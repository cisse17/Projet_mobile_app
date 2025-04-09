# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from app.database import SessionLocal
# from app.models.user import User
# from app.schemas.user import UserCreate, UserOut
# from app.utils.security import hash_password, verify_password, create_access_token

# router = APIRouter()

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# @router.post("/register", response_model=UserOut)
# def register(user: UserCreate, db: Session = Depends(get_db)):
#     if db.query(User).filter(User.email == user.email).first():
#         raise HTTPException(status_code=400, detail="Email already registered")
#     new_user = User(
#         username=user.username,
#         email=user.email,
#         hashed_password=hash_password(user.password)
#     )
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
#     return new_user

# @router.post("/login")
# def login(user: UserCreate, db: Session = Depends(get_db)):
#     db_user = db.query(User).filter(User.email == user.email).first()
#     if not db_user or not verify_password(user.password, db_user.hashed_password):
#         raise HTTPException(status_code=401, detail="Invalid credentials")
#     token = create_access_token(data={"sub": db_user.email})
#     return {"access_token": token, "token_type": "bearer"}

# ______test__________
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models import models
from app.schemas import schemas
from app.utils import utils
from typing import List, Optional

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    responses={404: {"description": "Not found"}},
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    hashed_pw = utils.hash_password(user.password)
    new_user = models.User(username=user.username, email=user.email, password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
async def login(
    user_data: schemas.UserLogin,
    db: Session = Depends(get_db)
):
    """
    Authentifie un utilisateur et retourne un token JWT.
    
    Format JSON attendu :
    {
        "email": "votre_email@example.com",
        "password": "votre_mot_de_passe"
    }
    
    Retourne un token JWT valide pour 30 minutes.
    """
    user = utils.authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = utils.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    """
    Déconnecte l'utilisateur en invalidant son token.
    
    - **token**: Token JWT de l'utilisateur
    
    Retourne un message de confirmation de déconnexion.
    """
    # Dans une implémentation réelle, vous voudriez peut-être ajouter le token à une liste noire
    # ou mettre à jour sa date d'expiration dans la base de données
    return {"message": "Déconnexion réussie"}

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(utils.get_current_user)):
    """
    Récupère les informations de l'utilisateur connecté.
    
    - **token**: Token JWT de l'utilisateur
    
    Retourne les informations de l'utilisateur.
    """
    return current_user
