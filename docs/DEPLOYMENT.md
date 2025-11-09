# RPN Calculator - Deployment Guide

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer (Optional)             │
│                      Nginx (Port 8080)                  │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐       ┌────────▼────────┐
│   Frontend     │       │    Backend      │
│  React + Nginx │       │  FastAPI        │
│   (Port 80)    │       │  (Port 8000)    │
└───────┬────────┘       └────────┬────────┘
        │                         │
        └─────────┬───────────────┘
                  │
         ┌────────▼────────┐
         │   Supabase DB   │
         │   (External)    │
         └─────────────────┘
```

## 📦 Components

### Frontend
- **Technology**: React 18 + TypeScript + Vite
- **Web Server**: Nginx 1.25 (Alpine)
- **Container**: Multi-stage build (Node builder + Nginx runtime)
- **Port**: 80 (HTTP)
- **Health Check**: `/health`

### Backend
- **Technology**: Python 3.11 + FastAPI
- **Server**: Uvicorn with 4-8 workers
- **Container**: Multi-stage build (Python builder + slim runtime)
- **Port**: 8000
- **Health Checks**: `/health`, `/ready`

### Database
- **Provider**: Supabase (External SaaS)
- **Tables**: `calculator_stack`, `stack_history`
- **Connection**: Environment variables

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- Ports 80, 8000 available

### Development Environment

```bash
# 1. Clone repository
git clone <repository-url>
cd project

# 2. Copy environment files
cp .env.example .env
cp rpn-calculator-api/.env.example rpn-calculator-api/.env

# 3. Configure Supabase credentials in .env
# Edit .env and add your Supabase URL and keys

# 4. Start development environment
make dev

# Services will be available at:
# - Frontend: http://localhost:5173 (Vite HMR)
# - Backend: http://localhost:8000 (Hot reload)
# - API Docs: http://localhost:8000/docs
```

### Production Environment

```bash
# 1. Build production images
make build

# 2. Start production environment
make up

# Services will be available at:
# - Frontend: http://localhost
# - Backend: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

## 🛠️ Makefile Commands

### Development
```bash
make dev          # Start dev environment with hot-reload
make dev-logs     # View development logs
make dev-down     # Stop development environment
```

### Production
```bash
make build        # Build production images
make up           # Start production environment
make down         # Stop production environment
make restart      # Restart all services
make logs         # View production logs
```

### Utilities
```bash
make ps           # List running containers
make health       # Check service health
make clean        # Remove all Docker resources
make test         # Run tests in containers
make shell-backend   # Open shell in backend
make shell-frontend  # Open shell in frontend
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
API_URL=http://backend:8000  # Internal Docker network
```

#### Backend (rpn-calculator-api/.env)
```env
LOG_LEVEL=info
WORKERS=4
API_PREFIX=/api/v1
CORS_ORIGINS=http://localhost:5173,http://localhost:80
```

### Docker Compose Files

- **docker-compose.yml**: Standard production setup
- **docker-compose.dev.yml**: Development with hot-reload
- **docker-compose.prod.yml**: Production with resource limits

## 📊 Resource Allocation

### Development
- **Backend**: No limits (development)
- **Frontend**: No limits (development)

### Production
- **Backend**:
  - Limit: 2 CPU, 1GB RAM
  - Reserved: 0.5 CPU, 256MB RAM
- **Frontend**:
  - Limit: 1 CPU, 512MB RAM
  - Reserved: 0.25 CPU, 128MB RAM

## 🏥 Health Checks

### Backend
```bash
curl http://localhost:8000/health
# Response: {"status": "healthy", "service": "rpn-calculator-api"}

curl http://localhost:8000/ready
# Response: {"status": "ready", "service": "rpn-calculator-api"}
```

### Frontend
```bash
curl http://localhost/health
# Response: healthy
```

## 🔍 Monitoring

### View Logs
```bash
# All services
make logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Check Container Status
```bash
make ps
# or
docker-compose ps
```

### Check Resource Usage
```bash
docker stats
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check backend logs
docker-compose logs backend

# Common issues:
# 1. Port 8000 already in use
lsof -i :8000
kill -9 <PID>

# 2. Python dependencies issue
docker-compose build --no-cache backend
```

### Frontend won't start
```bash
# Check frontend logs
docker-compose logs frontend

# Common issues:
# 1. Port 80 already in use
lsof -i :80

# 2. Build failed
docker-compose build --no-cache frontend
```

### Services can't communicate
```bash
# Check network
docker network ls
docker network inspect rpn-calculator-network

# Verify containers are on same network
docker-compose ps
```

### Database connection issues
```bash
# Verify Supabase credentials
cat .env | grep SUPABASE

# Test from backend container
docker-compose exec backend python -c "
from app.lib.supabase import supabase
print(supabase.table('calculator_stack').select('*').execute())
"
```

## 🔒 Security Best Practices

### Production Checklist
- [ ] Change default CORS origins
- [ ] Use HTTPS (configure SSL certificates)
- [ ] Set strong secrets/keys
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Implement authentication
- [ ] Use secrets management (Vault, AWS Secrets Manager)

### HTTPS Setup (Production)
```bash
# 1. Get SSL certificates (Let's Encrypt)
certbot certonly --standalone -d yourdomain.com

# 2. Mount certificates in docker-compose.prod.yml
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro

# 3. Update nginx config for HTTPS
# See nginx-ssl.conf example
```

## 🚢 Production Deployment

### AWS ECS
```bash
# 1. Build and push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <ecr-url>
docker-compose -f docker-compose.prod.yml build
docker tag rpn-frontend:latest <ecr-url>/rpn-frontend:latest
docker tag rpn-backend:latest <ecr-url>/rpn-backend:latest
docker push <ecr-url>/rpn-frontend:latest
docker push <ecr-url>/rpn-backend:latest

# 2. Create ECS task definition
# 3. Create ECS service with load balancer
```

### Docker Swarm
```bash
# 1. Initialize swarm
docker swarm init

# 2. Deploy stack
docker stack deploy -c docker-compose.prod.yml rpn-calculator

# 3. Check services
docker stack services rpn-calculator
```

### Kubernetes
```bash
# Convert to Kubernetes manifests
kompose convert -f docker-compose.prod.yml

# Apply manifests
kubectl apply -f ./kubernetes/

# Expose services
kubectl expose deployment frontend --type=LoadBalancer --port=80
```

## 📈 Scaling

### Horizontal Scaling (Docker Swarm)
```bash
# Scale backend
docker service scale rpn-calculator_backend=5

# Scale frontend
docker service scale rpn-calculator_frontend=3
```

### With docker-compose
```bash
docker-compose up -d --scale backend=3 --scale frontend=2
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build images
        run: make build
      - name: Run tests
        run: make test
      - name: Deploy
        run: make up
```

## 📝 Maintenance

### Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
make build
make restart
```

### Backups (if using local DB)
```bash
# Backup volumes
docker run --rm -v rpn-backend-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz /data
```

### Cleanup
```bash
# Remove old images
docker image prune -a

# Complete cleanup
make clean
```

## 📞 Support

For issues or questions:
1. Check logs: `make logs`
2. Verify health: `make health`
3. Review documentation
4. Open issue on repository

---

**Version**: 1.0.0
**Last Updated**: 2024
**Maintained By**: RPN Calculator Team
