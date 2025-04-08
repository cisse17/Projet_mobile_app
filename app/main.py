# from fastapi import FastAPI
# from app.database import Base, engine
# from app.routers import auth

# Base.metadata.create_all(bind=engine)

# app = FastAPI()
# app.include_router(auth.router)

# test
from fastapi import FastAPI
from app.database import engine
from app.models import models
from app.routers import auth, users, events

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(events.router)
