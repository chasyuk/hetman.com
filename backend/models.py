from sqlalchemy import Column, Integer, String, Boolean, Float
from database import Base


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    codename = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_verified = Column(Boolean, default=False)


class Weapon(Base):
    __tablename__ = 'weapons'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    caliber_mm = Column(Float)
    muzzle_velocity_ms = Column(Float)
    max_range_m = Column(Float)
