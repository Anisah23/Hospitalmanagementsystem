#!/bin/bash

set -e

echo "[INFO] Starting deployment to DigitalOcean Droplet..."

# --- CONFIG ---
DROPLET_IP=${DROPLET_IP:-""}
DROPLET_USER=${DROPLET_USER:-"root"}
SSH_KEY_PATH=${SSH_KEY_PATH:-"private_key.pem"}
REMOTE_DIR="/var/www/Hospitalmanagementsystem"

# --- SSH FUNCTION ---
ssh_exec() {
  ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" "$DROPLET_USER@$DROPLET_IP" "$@"
}

# --- CREATE REMOTE DEPLOYMENT DIRS ---
echo "[INFO] Ensuring remote directories exist..."
ssh_exec "sudo mkdir -p $REMOTE_DIR/backend $REMOTE_DIR/static && sudo chmod -R 755 $REMOTE_DIR"

# --- COPY FILES TO DROPLET ---
echo "[INFO] Uploading files to Droplet..."
scp -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" -r hospital-management-backend/* "$DROPLET_USER@$DROPLET_IP:$REMOTE_DIR/backend/"
scp -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" -r hospital-management-backend/static/* "$DROPLET_USER@$DROPLET_IP:$REMOTE_DIR/static/"

# --- RUN DEPLOYMENT COMMANDS ---
echo "[INFO] Restarting application on Droplet..."
ssh_exec "
  cd $REMOTE_DIR/backend &&
  sudo systemctl restart gunicorn || echo '[WARN] gunicorn not configured yet'
  sudo systemctl restart nginx || echo '[WARN] nginx not configured yet'
"

echo "[SUCCESS] Deployment complete! 🚀"
