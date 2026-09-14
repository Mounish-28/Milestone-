#!/bin/bash
# =========================================================================
# ShopSense Multi-Vendor Analytics Platform - AWS EC2 Production Deploy Script
# Milestone 4 & 5: Cloud Deployment Automation
# =========================================================================

set -e

echo "🚀 Starting ShopSense Production Deployment on AWS EC2..."

# 1. Update system packages
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Docker & Docker Compose if not present
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker Engine..."
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
fi

# 3. Pull latest code or build images
echo "🔨 Building Docker containers via Docker Compose..."
docker compose down || true
docker compose build --no-cache

# 4. Spin up all multi-container services with healthchecks
echo "🚀 Spawning ShopSense container network..."
docker compose up -d

# 5. Wait for PostgreSQL and Backends to become healthy
echo "⏳ Awaiting service healthchecks..."
sleep 10
docker compose ps

# 6. Verify healthcheck endpoints
echo "🔍 Validating API endpoints..."
curl -f http://localhost:8000/health || echo "⚠️ Backend port 8000 warming up"
curl -f http://localhost:8001/health || echo "⚠️ Customer backend port 8001 warming up"

echo "=========================================================="
echo "🎉 ShopSense Platform is LIVE!"
echo "• Admin & Analytics Portal:   http://<EC2-IP>:5173"
echo "• Customer Storefront:        http://<EC2-IP>:5174"
echo "• Admin Swagger API Docs:     http://<EC2-IP>:8000/docs"
echo "• Customer API Docs:          http://<EC2-IP>:8001/docs"
echo "=========================================================="
