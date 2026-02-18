# frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# --host is CRITICAL to access it from your browser outside the container
CMD ["npm", "run", "dev", "--", "--host"]
