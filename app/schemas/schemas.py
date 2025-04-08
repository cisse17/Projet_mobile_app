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
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: datetime
    location: str

class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    date: datetime
    location: str
    organizer_id: int

    class Config:
        from_attributes = True


