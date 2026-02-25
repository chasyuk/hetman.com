import math
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from pydantic import BaseModel
from geopy.distance import geodesic
from utils import SECRET_KEY, ALGORITHM, hash_password, verify_password, create_access_token
from database import engine, Base
from models import User
from schemas import UserCreate, UserLogin, UserResponse
from auth import get_db, get_current_user

app = FastAPI()

Base.metadata.create_all(bind=engine)


# ─── Artillery Calculator ───────────────────────────────────────

class ShotRequest(BaseModel):
    cannon_lat: float
    cannon_lng: float
    target_lat: float
    target_lng: float
    velocity: float
    max_range: float


def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate azimuth (bearing) between two geographic points."""
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    diff_lon = lon2 - lon1
    x = math.sin(diff_lon) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - (
        math.sin(lat1) * math.cos(lat2) * math.cos(diff_lon)
    )
    initial_bearing = math.atan2(x, y)
    return (math.degrees(initial_bearing) + 360) % 360


@app.post("/calculate_shot")
def calculate_shot(data: ShotRequest):
    cannon_coords = (data.cannon_lat, data.cannon_lng)
    target_coords = (data.target_lat, data.target_lng)

    # 1. Distance
    distance_meters = geodesic(cannon_coords, target_coords).meters

    # Check if target is within range
    if distance_meters > data.max_range:
        return {
            "status": "error",
            "message": (
                f"Ціль за межами досяжності! "
                f"Максимальна дальність: {data.max_range} м. "
                f"Відстань до цілі: {round(distance_meters)} м."
            ),
        }

    # 2. Azimuth
    azimuth = calculate_bearing(
        cannon_coords[0], cannon_coords[1],
        target_coords[0], target_coords[1],
    )

    # 3. Elevation angle
    g = 9.81
    val = (distance_meters * g) / (data.velocity ** 2)

    if val > 1:
        return {
            "status": "error",
            "message": "Фізично неможливо докинути снаряд з такою швидкістю на таку відстань.",
        }

    elevation_angle = math.degrees(math.asin(val) / 2)

    return {
        "status": "success",
        "distance": round(distance_meters, 2),
        "azimuth": round(azimuth, 2),
        "elevation": round(elevation_angle, 2),
    }


# ─── Auth Endpoints ─────────────────────────────────────────────

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
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")
    access_token = create_access_token({'sub': str(db_user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.get("/verify/{token}")
def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=400, detail="Invalid token")

    except JWTError as exc:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired token"
        ) from exc

    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    user.is_verified = True
    db.commit()
    return {"message": "Email verified successfully"}

@app.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user
