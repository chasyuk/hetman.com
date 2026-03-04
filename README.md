# 🎯 Hetman — Artillery Fire Control Simulator

<div align="center">

**A full-stack artillery ballistics simulator with an interactive map, real-time trajectory calculations, and a militaristic UI.**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![Leaflet](https://img.shields.io/badge/Map-Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Interactive Map** | Place batteries and targets directly on a Leaflet-powered map with a dark, military-themed tile layer |
| 📐 **Ballistic Calculator** | Real-time firing solutions — azimuth, elevation angle, and flight time — using physics-based projectile math |
| 🔫 **Weapon Database** | 20 pre-seeded historical artillery pieces (75 mm–203 mm) with caliber, muzzle velocity, and max range |
| 🎯 **Preset System** | Save and load map presets (battery positions, targets, weapon configs) per user account |
| 👤 **User Accounts** | Registration with email verification, JWT authentication, and personal profiles |
| 📱 **Mobile Ready** | Responsive bottom-sheet layout on phones, enlarged touch targets, and dynamic viewport support |
| 🎨 **Military Aesthetic** | Dark theme with amber accents, particle effects, scroll-reveal animations, and film-grain overlay |

---

## 🏗️ Tech Stack

### Backend

- **FastAPI** — async Python API framework
- **SQLAlchemy** — ORM with SQLite storage
- **Jose (JWT)** — token-based authentication
- **Geopy** — geodesic distance calculations
- **Bcrypt** — password hashing

### Frontend

- **React 18** + **Vite** — fast SPA with HMR
- **React-Leaflet** — interactive map component
- **Axios** — HTTP client
- **CSS3** — custom design system (no frameworks), animations, glassmorphism

### DevOps

- **Docker Compose** — single-command local development
- **Render** — cloud deployment (via `render.yaml`)

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

### Run locally

```bash
# Clone the repository
git clone https://github.com/your-username/hetman.git
cd hetman

# Start everything
docker compose up --build
```

| Service | URL |
|---|---|
| 🌐 Frontend | [http://localhost:5173](http://localhost:5173) |
| 🔧 Backend API | [http://localhost:8000](http://localhost:8000) |
| 📄 API Docs | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## 📁 Project Structure

```
hetman/
├── backend/
│   ├── app.py              # FastAPI application & all endpoints
│   ├── models.py           # SQLAlchemy models (User, Weapon, MapPreset)
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── auth.py             # JWT token utilities
│   ├── database.py         # DB engine & session setup
│   ├── utils.py            # Email verification helpers
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Landing page with animated hero section
│   │   ├── App.css             # Global design system & responsive layout
│   │   ├── FireControl.jsx     # 🎯 Main simulator — map, weapons, firing
│   │   ├── Registration.jsx    # Sign-up / login forms
│   │   ├── Profile.jsx         # User profile page
│   │   ├── navigationPanel.jsx # Animated navigation bar
│   │   ├── AuthContext.jsx     # React auth context provider
│   │   ├── ScrollReveal.jsx    # Intersection Observer animations
│   │   ├── ParticleField.jsx   # Canvas particle background effect
│   │   └── api.js              # Axios instance config
│   ├── Dockerfile
│   └── docker-entrypoint.sh
│
├── docker-compose.yml    # Local dev orchestration
├── render.yaml           # Render.com deploy config
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Create a new account |
| `POST` | `/login` | Get JWT access token |
| `GET` | `/verify-email/{token}` | Verify email address |
| `GET` | `/me` | Get current user profile |

### Fire Control

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/weapons` | List all available weapons |
| `POST` | `/calculate` | Compute firing solution |

### Presets

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/presets` | List user's saved presets |
| `POST` | `/presets` | Save a new preset |
| `DELETE` | `/presets/{id}` | Delete a preset |
| `POST` | `/presets/{id}/favourite` | Toggle favourite status |

---

## 🧮 Ballistic Model

The simulator computes firing solutions using projectile motion physics:

```
Distance  =  geodesic(battery_coords, target_coords)
Azimuth   =  bearing(battery → target)
Elevation =  ½ · arcsin(g · distance / velocity²)
Flight    =  distance / (velocity · cos(elevation))
```

> **Note:** The model assumes flat-earth approximation for short-range engagements and does not account for drag, wind, or Coriolis effect.

---

## 🎨 Design Philosophy

The UI follows a **military command-post** aesthetic:

- **Color palette:** Deep olive `#0a0c09` base, amber `#d97706` accents, muted greens
- **Typography:** `Rajdhani` for headers, `Share Tech Mono` for data readouts
- **Effects:** `backdrop-filter` glassmorphism, CSS particle fields, scroll-triggered reveals
- **Map styling:** Desaturated, high-contrast tiles with sepia/hue-rotate filters

---

## 📱 Responsive Design

| Breakpoint | Layout |
|---|---|
| **> 1400px** | Wide panels, full desktop experience |
| **769–1400px** | Narrowed panels, same arrangement |
| **≤ 768px** | Bottom-sheet control panel, hidden map tools, enlarged touch targets |

---

## 📜 License

This project was developed as a university coursework project.

---

<div align="center">

**Made with ☕ and 🎯 precision**

</div>
