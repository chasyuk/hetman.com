import math
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from pydantic import BaseModel
from geopy.distance import geodesic
from utils import SECRET_KEY, ALGORITHM, hash_password, verify_password, create_access_token
from database import engine, Base
from models import User, Weapon
from schemas import UserCreate, UserLogin, UserResponse
from auth import get_db, get_current_user

app = FastAPI()

Base.metadata.create_all(bind=engine)

SEED_WEAPONS = [
    {"name": "10.5 cm leFH 18", "caliber_mm": 105, "muzzle_velocity_ms": 470, "max_range_m": 10675},
    {"name": "100 mm field gun M1944 (BS-3)", "caliber_mm": 100, "muzzle_velocity_ms": 900, "max_range_m": 20000},
    {"name": "122 mm gun M1931/37 (A-19)", "caliber_mm": 122, "muzzle_velocity_ms": 806, "max_range_m": 20400},
    {"name": "122 mm howitzer 2A18 (D-30)", "caliber_mm": 122, "muzzle_velocity_ms": 690, "max_range_m": 21900},
    {"name": "122 mm howitzer M1938 (M-30)", "caliber_mm": 121.92, "muzzle_velocity_ms": 515, "max_range_m": 11800},
    {"name": "130 mm towed field gun M1954 (M-46)", "caliber_mm": 130, "muzzle_velocity_ms": 930, "max_range_m": 27150},
    {"name": "15 cm sFH 18", "caliber_mm": 149, "muzzle_velocity_ms": 520, "max_range_m": 18200},
    {"name": "152 mm gun-howitzer D-20", "caliber_mm": 152.4, "muzzle_velocity_ms": 650, "max_range_m": 24000},
    {"name": "152 mm howitzer 2A65 Msta-B", "caliber_mm": 152.4, "muzzle_velocity_ms": 828, "max_range_m": 24700},
    {"name": "152 mm howitzer M1943 (D-1)", "caliber_mm": 152.4, "muzzle_velocity_ms": 508, "max_range_m": 12400},
    {"name": "152 mm howitzer-gun M1937 (ML-20)", "caliber_mm": 152.4, "muzzle_velocity_ms": 655, "max_range_m": 17230},
    {"name": "155 mm gun M1 (Long Tom)", "caliber_mm": 155, "muzzle_velocity_ms": 853, "max_range_m": 23700},
    {"name": "203 mm howitzer M1931 (B-4)", "caliber_mm": 203.2, "muzzle_velocity_ms": 607, "max_range_m": 18000},
    {"name": "85 mm divisional gun D-44", "caliber_mm": 85, "muzzle_velocity_ms": 1030, "max_range_m": 15650},
    {"name": "Canon de 75 modèle 1897", "caliber_mm": 75, "muzzle_velocity_ms": 500, "max_range_m": 11000},
    {"name": "M102 howitzer", "caliber_mm": 105, "muzzle_velocity_ms": 494, "max_range_m": 15100},
    {"name": "M114 155 mm howitzer", "caliber_mm": 155, "muzzle_velocity_ms": 563, "max_range_m": 14600},
    {"name": "M198 howitzer", "caliber_mm": 155, "muzzle_velocity_ms": 684, "max_range_m": 40000},
    {"name": "M777 Lightweight Towed Howitzer", "caliber_mm": 155, "muzzle_velocity_ms": 827, "max_range_m": 40000},
    {"name": "Ordnance QF 25-pounder", "caliber_mm": 87.6, "muzzle_velocity_ms": 532, "max_range_m": 12253},
]


@app.on_event("startup")
def seed_weapons():
    db = next(get_db())
    try:
        if db.query(Weapon).count() == 0:
            for w in SEED_WEAPONS:
                db.add(Weapon(**w))
            db.commit()
    finally:
        db.close()


@app.get("/weapons")
def list_weapons(db: Session = Depends(get_db)):
    weapons = db.query(Weapon).all()
    return [
        {
            "id": w.id,
            "name": w.name,
            "caliber_mm": w.caliber_mm,
            "muzzle_velocity_ms": w.muzzle_velocity_ms,
            "max_range_m": w.max_range_m,
        }
        for w in weapons
    ]


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

    distance_meters = geodesic(cannon_coords, target_coords).meters

    if distance_meters > data.max_range:
        return {
            "status": "error",
            "message": (
                f"Ціль за межами досяжності! "
                f"Максимальна дальність: {data.max_range} м. "
                f"Відстань до цілі: {round(distance_meters)} м."
            ),
        }

    azimuth = calculate_bearing(
        cannon_coords[0], cannon_coords[1],
        target_coords[0], target_coords[1],
    )

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


@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        codename=user.codename,
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id)})
    return {"message": "User created", "verification_token": token}


@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")
    access_token = create_access_token({"sub": str(db_user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
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
            detail="Invalid or expired token",
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
