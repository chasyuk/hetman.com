# backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies first (for better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# --host 0.0.0.0 is CRITICAL for Docker networking
CMD ["uvicorn", "login:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
