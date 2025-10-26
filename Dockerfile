# Multi-stage build for the entire hospital management system

# Build frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY hospital-management-frontend/package*.json ./
RUN npm ci --only=production
COPY hospital-management-frontend/ ./
RUN npm run build

# Backend stage
FROM python:3.12-slim as backend
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY hospital-management-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy backend code
COPY hospital-management-backend/ ./

# Copy built frontend to backend static files
COPY --from=frontend-build /app/frontend/build ./static

# Copy nginx configuration
COPY hospital-management-backend/nginx.conf /etc/nginx/sites-available/app
RUN ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/ && \
    rm /etc/nginx/sites-enabled/default

# Copy supervisor configuration
COPY hospital-management-backend/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create log directories
RUN mkdir -p /var/log/supervisor /var/log/gunicorn

# Expose port
EXPOSE 80

# Set environment variables
ENV FLASK_ENV=production
ENV DATABASE_URL=${DATABASE_URL}

# Run supervisor to manage both nginx and gunicorn
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]