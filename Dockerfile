# Build the Vite site with a current Node (Vite 8 needs >=22.12; Coolify's
# nixpacks builder only offers 22.11, so we pin the build environment here).
# Coolify's static build pack then serves the resulting /app/dist via nginx.
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
