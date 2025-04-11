# from pydantic import BaseModel, EmailStr

# class UserCreate(BaseModel):
#     username: str
#     email: EmailStr
#     password: str

# class UserOut(BaseModel):
#     id: int
#     username: str
#     email: EmailStr

#     class Config:
#         orm_mode = True


from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class Token(BaseModel):
    """
    Modèle de réponse pour l'authentification.
    
    Attributes:
        access_token (str): Token JWT pour l'authentification
        token_type (str): Type de token (toujours "bearer")
    """
    access_token: str
    token_type: str

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }

class UserBase(BaseModel):
    email: EmailStr
    username: str
    description: Optional[str] = None
    instruments_played: Optional[str] = None

class UserCreate(UserBase):
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "username": "johndoe",
                "password": "strongpassword123",
                "description": "Musicien passionné de jazz",
                "instruments_played": "Piano, Saxophone"
            }
        }

class UserLogin(BaseModel):
    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "strongpassword123"
            }
        }

class User(UserBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "username": "johndoe",
                "description": "Musicien passionné de jazz",
                "instruments_played": "Piano, Saxophone",
                "created_at": "2024-03-14T12:00:00Z"
            }
        }

class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "username": "johndoe",
                "description": "Musicien passionné de jazz",
                "instruments_played": "Piano, Saxophone",
                "created_at": "2024-03-14T12:00:00Z"
            }
        }

class EventBase(BaseModel):
    title: str
    description: str
    date: datetime
    location: str

class EventCreate(EventBase):
    pass

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Concert de rock",
                "description": "Un super concert de rock",
                "date": "2024-04-01T20:00:00Z",
                "location": "Paris, France"
            }
        }

class EventResponse(EventBase):
    id: int
    organizer_id: int
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "Concert de rock",
                "description": "Un super concert de rock",
                "date": "2024-04-01T20:00:00Z",
                "location": "Paris, France",
                "organizer_id": 1,
                "created_at": "2024-03-14T12:00:00Z"
            }
        }

class MessageBase(BaseModel):
    content: str
    receiver_id: int

class MessageCreate(MessageBase):
    pass

    class Config:
        json_schema_extra = {
            "example": {
                "content": "Bonjour !",
                "receiver_id": 2
            }
        }

class MessageResponse(MessageBase):
    id: int
    sender_id: int
    created_at: datetime
    is_read: bool

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "content": "Bonjour !",
                "sender_id": 1,
                "receiver_id": 2,
                "created_at": "2024-03-14T12:00:00Z",
                "is_read": False
            }
        }

class MessageListResponse(BaseModel):
    messages: List[MessageResponse]
    unread: int

    class Config:
        json_schema_extra = {
            "example": {
                "messages": [
                    {
                        "id": 1,
                        "content": "Bonjour !",
                        "sender_id": 1,
                        "receiver_id": 2,
                        "created_at": "2024-03-14T12:00:00Z",
                        "is_read": False
                    }
                ],
                "unread": 1
            }
        }


