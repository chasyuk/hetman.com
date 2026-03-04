from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    codename = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_verified = Column(Boolean, default=False)
    presets = relationship("MapPreset", back_populates="user", cascade="all, delete-orphan")


class Weapon(Base):
    __tablename__ = 'weapons'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    caliber_mm = Column(Float)
    muzzle_velocity_ms = Column(Float)
    max_range_m = Column(Float)
    image_url = Column(String, default="")


class MapPreset(Base):
    __tablename__ = 'map_presets'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    name = Column(String, nullable=False)
    units_json = Column(Text, nullable=False)
    is_favourite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="presets")
