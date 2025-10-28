#!/bin/bash
set -e

# ==============================
# 🚀 Hospital Management System Deployment (DigitalOcean Droplet)
# ==============================

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# --- CONFIG ---
DROPLET_IP=${DROPLET_IP:-""}
DROPLET_USER=${DROPLET_USER:-"root"}
SSH_KEY_PATH=${SSH_KEY_PATH:-"/home/anisah/ssh/digitalocean"}

# --- DEPLOYMENT ---
print_status "Starting deployment to DigitalOcean Droplet..."

if [ -z "$DROPLET_IP" ]; then
    print_error "❌ DROPLET_IP not set. Exiting."
    exit 1
fi

# SSH into Droplet and perform deployment
ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << 'EOF'
    set -e
    echo "🚀 Deploying Hospital Management System (Frontend + Backend)..."

    # Navigate to app directory
    cd /var/www/Hospitalmanagementsystem || exit 1

    # Pull latest code
    git pull origin main

    # ===============================
    # 🧱 FRONTEND DEPLOYMENT
    # ===============================
    echo "🧱 Building frontend..."
    cd hospital-management-frontend
    npm install
    npm run build

    # Copy built files to backend static folder
    rm -rf ../hospital-management-backend/static/*
    mkdir -p ../hospital-management-backend/static
    cp -r dist/* ../hospital-management-backend/static/
    cd ..

    # ===============================
    # ⚙️ BACKEND DEPLOYMENT
    # ===============================
    echo "⚙️ Updating backend..."
    cd hospital-management-backend
    source venv/bin/activate
    pip install -r requirements.txt

    # Apply database migrations (if any)
    flask db upgrade || echo "No migrations found."

    # Restart backend and Nginx
    sudo systemctl restart gunicorn
    sudo systemctl restart nginx

    echo "✅ Deployment complete!"
EOF
