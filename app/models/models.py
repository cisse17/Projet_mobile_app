from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, event
from sqlalchemy.orm import relationship, validates
from datetime import datetime
import pytz
from app.database import Base
import re

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    instruments_played = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    events = relationship("Event", back_populates="organizer")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")

    @validates('email')
    def validate_email(self, key, email):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            raise ValueError("Email invalide")
        return email

    @validates('username')
    def validate_username(self, key, username):
        if len(username) < 3:
            raise ValueError("Le nom d'utilisateur doit contenir au moins 3 caractères")
        return username

    @classmethod
    def get_by_email(cls, db, email):
        return db.query(cls).filter(cls.email == email).first()

    @classmethod
    def get_by_id(cls, db, user_id):
        return db.query(cls).filter(cls.id == user_id).first()

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "description": self.description,
            "instruments_played": self.instruments_played,
            "created_at": self.created_at
        }

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    date = Column(DateTime, nullable=False)
    location = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    organizer = relationship("User", back_populates="events")

    @validates('date')
    def validate_date(self, key, date):
        # Convertir la date actuelle en UTC
        now = datetime.now(pytz.UTC)
        # S'assurer que la date de l'événement a un fuseau horaire
        if date.tzinfo is None:
            date = pytz.UTC.localize(date)
        if date < now:
            raise ValueError("La date de l'événement ne peut pas être dans le passé")
        return date

    @classmethod
    def get_by_id(cls, db, event_id):
        return db.query(cls).filter(cls.id == event_id).first()

    @classmethod
    def get_by_organizer(cls, db, organizer_id):
        return db.query(cls).filter(cls.organizer_id == organizer_id).all()

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "date": self.date,
            "location": self.location,
            "organizer_id": self.organizer_id,
            "created_at": self.created_at
        }

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_read = Column(Boolean, default=False)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
    queue_entries = relationship("MessageQueue", back_populates="message")

    @validates('content')
    def validate_content(self, key, content):
        if len(content.strip()) == 0:
            raise ValueError("Le contenu du message ne peut pas être vide")
        return content

    @classmethod
    def get_by_id(cls, db, message_id):
        return db.query(cls).filter(cls.id == message_id).first()

    @classmethod
    def get_user_messages(cls, db, user_id, received=True):
        if received:
            return db.query(cls).filter(cls.receiver_id == user_id).all()
        return db.query(cls).filter(cls.sender_id == user_id).all()

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "created_at": self.created_at,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "is_read": self.is_read
        }

class MessageQueue(Base):
    __tablename__ = "message_queue"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    delivered = Column(Boolean, default=False)
    delivery_attempts = Column(Integer, default=0)

    # Relations
    message = relationship("Message", back_populates="queue_entries")
    user = relationship("User")
