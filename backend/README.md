# FastAPI Auth Backend

Simple FastAPI backend with user registration and login.

## Setup
### 1. Create virtual environment
Windows:
```
python -m venv venv
venv\Scripts\activate
```
Mac/Linux:
```
python -m venv venv
source venv/bin/activate
```
### 2. Install dependencies
```
pip install -r requirements.txt
```
### 3. Run server

```
uvicorn main:app --reload
```

Server will start at:

```
http://127.0.0.1:8000
```

API docs:

```
http://127.0.0.1:8000/docs
```
