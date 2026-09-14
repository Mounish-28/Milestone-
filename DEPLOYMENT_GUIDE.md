# 🚀 ShopSense Multi-Vendor Analytics Platform - Deployment Guide
## Milestone 4 & Milestone 5: Production Deployment & Containerization

ShopSense is packaged as a multi-tier microservice architecture that can be deployed across local containers, cloud VM instances (AWS EC2), and modern managed platforms (Render, Railway, Fly.io, Heroku) with PostgreSQL or SQLite.

---

## 🏗️ Architecture Stack Overview

| Component | Technology | Default Port | Description |
| :--- | :--- | :--- | :--- |
| **PostgreSQL Database** | PostgreSQL 16 Alpine | `5432` | Production ACID Relational Database |
| **Admin Backend** | Python 3.11 + FastAPI | `8000` | Analytics, Vendor Clearance, LangGraph AI Copilot |
| **Customer Backend** | Python 3.11 + FastAPI | `8001` | Catalog, RAG Assistant, Orders, Live Tracking |
| **Admin Portal** | React 19 + Vite + Nginx | `5173` | Interactive Dashboards, Clearance Desks, Agent Hub |
| **Customer Storefront** | React 19 + Vite + Nginx | `5174` | Marketplace, Cart, VIP Savings, Voice Search |

---

## 🐳 Option 1: Multi-Container Orchestration with Docker Compose (Recommended)

To run the entire multi-service ecosystem (PostgreSQL, 2 FastAPI Backends, 2 React Frontends) with a single command:

```bash
# Build and launch all containers in detached mode
docker compose up -d --build

# Inspect container status and healthchecks
docker compose ps

# View live color-coded logs
docker compose logs -f

# Gracefully terminate containers and preserve persistent volume
docker compose down
```

### Verification
Once launched, verify service health via curl or browser:
* Admin Backend: [http://localhost:8000/health](http://localhost:8000/health)
* Admin Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
* Customer Backend: [http://localhost:8001/health](http://localhost:8001/health)
* Admin Frontend: [http://localhost:5173](http://localhost:5173)
* Customer Frontend: [http://localhost:5174](http://localhost:5174)

---

## ☁️ Option 2: 1-Click Cloud Deployment via Render Blueprint

The repository includes a ready-to-use `render.yaml` blueprint:

1. Push your repository to GitHub.
2. Log into [Render.com](https://render.com).
3. Click **New +** -> **Blueprint**.
4. Select your GitHub repository.
5. Render will automatically provision:
   - Managed **PostgreSQL** database instance (`shopsense-db`)
   - Admin FastAPI Web Service (`shopsense-admin-backend`)
   - Customer FastAPI Web Service (`shopsense-customer-backend`)
   - Admin React Static Site (`shopsense-admin-portal`)
   - Customer React Static Site (`shopsense-customer-storefront`)
6. Click **Apply** to deploy!

---

## 🌐 Option 3: AWS EC2 Ubuntu Production Deployment

To deploy onto an AWS EC2 instance (Ubuntu 22.04 / 24.04 LTS):

1. Launch an EC2 Instance (t3.medium recommended).
2. Configure Security Group Inbound Rules:
   - `22` (SSH)
   - `80` / `443` (HTTP/HTTPS)
   - `5173` (Admin Portal)
   - `5174` (Customer Storefront)
   - `8000` (Admin API)
   - `8001` (Customer API)
3. Connect to your instance via SSH:
   ```bash
   ssh -i your-key.pem ubuntu@<your-ec2-ip>
   ```
4. Clone the repository and execute the automated deploy script:
   ```bash
   git clone https://github.com/your-username/ShopSense-Platform.git
   cd ShopSense-Platform
   chmod +x deploy/aws-ec2-deploy.sh
   ./deploy/aws-ec2-deploy.sh
   ```

---

## 🧪 Option 4: Local Development & Automated Pytest Suite

Run all services concurrently on your local machine:

```bash
# Run all 4 services concurrently
npm start

# Run full automated Pytest test suite (Milestones 1 to 5)
npm test
# OR
python -m pytest tests/ -v
```

---

## ⚙️ Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///shopsense.db` | PostgreSQL or SQLite connection string |
| `PORT` | `8000` (or `8001`) | Listening port for FastAPI servers |
| `VITE_API_URL` | `http://localhost:8000` | Base URL used by React frontends |
| `SMTP_HOST` | `smtp.gmail.com` | Live SMTP server for executive email advisory |
| `SMTP_PORT` | `587` | SMTP port (TLS) |
| `SMTP_USER` | `your_email@gmail.com` | SMTP username / email address |
| `SMTP_PASSWORD` | `your_app_password` | 16-digit Google App Password |
