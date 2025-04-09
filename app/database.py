# test
# from dotenv import load_dotenv
# load_dotenv()

# import os
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, declarative_base

# DATABASE_URL = os.getenv("DATABASE_URL")
# if not DATABASE_URL:
#     raise ValueError("DATABASE_URL not found. Please check your .env file.")

# engine = create_engine(DATABASE_URL)
# SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
# Base = declarative_base()



# ________
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print("👉 DATABASE_URL:", DATABASE_URL)

# Ajout de paramètres de connexion pour plus de robustesse
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Vérifie la connexion avant de l'utiliser
    pool_recycle=300,    # Recycle les connexions après 5 minutes
    pool_timeout=30,     # Timeout de 30 secondes pour obtenir une connexion
    max_overflow=10      # Nombre maximum de connexions supplémentaires
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
