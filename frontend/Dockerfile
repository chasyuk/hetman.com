# frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
<<<<<<< HEAD
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
=======
RUN npm install
>>>>>>> 228d747 (add interface)

# Copy source code
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# --host is CRITICAL to access it from your browser outside the container
CMD ["npm", "run", "dev", "--", "--host"]
