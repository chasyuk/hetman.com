from pydantic import BaseModel, EmailStr, ConfigDict

class UserCreate(BaseModel):
    codename: str
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    codename: str
    name: str
    email: EmailStr
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)
