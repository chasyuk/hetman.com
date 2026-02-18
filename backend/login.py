from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext

app = FastAPI()

origins = [
    "http://localhost:8000",  # React's default port
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db: dict[str, dict] = {}
class RegisterUser(BaseModel):
    codename: str
    name: str
    email: EmailStr
    password: str

class LoginUser(BaseModel):
    email: EmailStr
    password: str

@app.post("/register")
def register(user: RegisterUser):
    if user.email in db:
        raise HTTPException(status_code=400, detail="The user already exists")
    hashed_password = pwd_context.hash(user.password)
    db[user.email] = {
        'codename': user.codename,
        'name': user.name,
        'hashed_password': hashed_password
        }
    print("CURRENT DB STATE:", db)
    return {'message': "User registered"}
@app.post('/login')
def login(user: LoginUser):
    if user.email not in db:
        raise HTTPException(status_code=400, detail="Incorrect login or password")
    hashed_password = db[user.email]['hashed_password']
    if not pwd_context.verify(user.password, hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect login or password")
    return {
        "message": "Login successful",
        "access_token": "some-random-generated-string-or-jwt",
        "token_type": "bearer"
    }
