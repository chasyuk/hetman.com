from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, Base
from models import User
from schemas import UserCreate, UserLogin, UserResponse
from utils import hash_password, verify_password, create_access_token
from auth import get_db, get_current_user

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.post("/register")
def register(user: UserCreate,db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(codename = user.codename, name = user.name, \
                    email = user.email, hashed_password = hash_password(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({'sub': str(new_user.id)})
    return {'message': 'User created', 'verification_token': token}

@app.post('/login')
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")
    access_token = create_access_token({'sub': str(db_user.id)})
    return {'access_token': access_token}

@app.get("/verify/{token}")
def verify_email(token: str, db: Session = Depends(get_db)):

    from jose import jwt
    from utils import SECRET_KEY, ALGORITHM

    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    user.is_verified = True
    db.commit()
    return {"message": "Email verified successfully"}

@app.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

