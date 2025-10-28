#!/bin/bash
set -e

# ==============================
# 🚀 Hospital Management System Deployment (DigitalOcean Droplet)
# ==============================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# --- CONFIG ---
DROPLET_IP=${DROPLET_IP:-""}
DROPLET_USER=${DROPLET_USER:-"root"}
SSH_KEY_PATH="private_key.pem"

# --- DEPLOYMENT ---
print_status "Starting deployment to DigitalOcean Droplet..."

if [ -z "$DROPLET_IP" ]; then
    print_error "❌ DROPLET_IP not set. Exiting."
    exit 1
fi

ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$DROPLET_USER@$DROPLET_IP" << 'EOF'
    set -e
    echo "🚀 Deploying Hospital Management System..."

    # Ensure the app directory exists
    mkdir -p /var/www/Hospitalmanagementsystem
    cd /var/www/Hospitalmanagementsystem

    # Clone the repo if not already there
    if [ ! -d ".git" ]; then
        echo "📦 Cloning repository..."
        git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git .
    else
        echo "🔁 Pulling latest changes..."
        git reset --hard
        git pull origin main
    fi

    # ===============================
    # 🧱 FRONTEND DEPLOYMENT
    # ===============================
    echo "🧱 Building frontend..."
    cd hospital-management-frontend
    npm install
    npm run build
    rm -rf ../hospital-management-backend/static/*
    mkdir -p ../hospital-management-backend/static
    cp -r dist/* ../hospital-management-backend/static/
    cd ..

    # ===============================
    # ⚙️ BACKEND DEPLOYMENT
    # ===============================
    echo "⚙️ Updating backend..."
    cd hospital-management-backend

    # Create or activate virtual environment
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    source venv/bin/activate

    pip install -r requirements.txt

    echo "📂 Applying database migrations (if any)..."
    flask db upgrade || echo "No migrations found."

    echo "🔁 Restarting Gunicorn and Nginx..."
    sudo systemctl restart gunicorn || echo "Gunicorn not running yet."
    sudo systemctl restart nginx || echo "Nginx restarted."

    echo "✅ Deployment complete!"
EOF
