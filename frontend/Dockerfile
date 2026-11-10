# Multi-stage Frontend Dockerfile (Vite React + Nginx Alpine)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY index.html ./

RUN npm install

COPY src ./src

# Build production assets (relative base path supported)
RUN npm run build

# Nginx Alpine Production Runner
FROM nginx:alpine

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy build result to nginx root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 inside container
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
