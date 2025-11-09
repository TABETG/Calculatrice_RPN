# Docker Architecture - RPN Calculator

## 🏗️ Overview

This document describes the Docker architecture, separation of concerns, and best practices implemented for the RPN Calculator application at a CTO level.

## 📐 Architecture Principles

### 1. Complete Frontend/Backend Separation
- **Independent containers**: Frontend and backend run in isolated containers
- **No shared volumes**: Each service manages its own code and dependencies
- **Network communication**: Services communicate via Docker network
- **Scalable independently**: Can scale frontend and backend separately

### 2. Multi-Stage Builds
- **Smaller images**: Reduce production image size by 60-80%
- **Build isolation**: Build artifacts don't pollute runtime
- **Security**: No build tools in production images
- **Faster deploys**: Smaller images = faster pulls and starts

### 3. Production-Ready Patterns
- **Non-root users**: All containers run as non-root
- **Health checks**: Integrated health monitoring
- **Resource limits**: CPU and memory constraints
- **Logging**: Structured JSON logs with rotation
- **Restart policies**: Auto-restart on failure

## 🐳 Container Details

### Frontend Container

#### Multi-Stage Build Process
```dockerfile
Stage 1: Builder (node:20-alpine)
├── Install dependencies (npm ci)
├── Copy source code
└── Build production bundle (npm run build)
    └── Output: /build/dist/

Stage 2: Runtime (nginx:1.25-alpine)
├── Copy custom nginx.conf
├── Copy built assets from builder
└── Expose port 80
```

#### Key Features
- **Base image**: nginx:1.25-alpine (~40MB)
- **Final size**: ~50MB (including app)
- **Web server**: Nginx with optimized config
- **Compression**: Gzip enabled for assets
- **Caching**: 1-year cache for static assets
- **SPA routing**: Fallback to index.html
- **Reverse proxy**: /api/* → backend:8000
- **Security headers**: X-Frame-Options, CSP, etc.

#### Nginx Configuration
```nginx
- Gzip compression
- Static asset caching (1 year)
- Security headers
- API proxy to backend
- SPA fallback routing
- Health check endpoint (/health)
```

### Backend Container

#### Multi-Stage Build Process
```dockerfile
Stage 1: Builder (python:3.11-slim)
├── Install build dependencies (gcc)
├── Create virtual environment
├── Install Python packages
└── Output: /opt/venv/

Stage 2: Runtime (python:3.11-slim)
├── Create non-root user (appuser)
├── Copy virtual environment
├── Copy application code
└── Expose port 8000
```

#### Key Features
- **Base image**: python:3.11-slim (~150MB)
- **Final size**: ~250MB (including dependencies)
- **ASGI server**: Uvicorn with 4-8 workers
- **Workers**: Configurable via environment
- **Health checks**: /health and /ready endpoints
- **Non-root**: Runs as 'appuser'
- **Virtual env**: Isolated Python environment

#### Uvicorn Configuration
```bash
uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --workers 4
```

## 🔗 Networking

### Docker Network Architecture
```
┌─────────────────────────────────────┐
│     Host Machine (Your Computer)    │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Docker Network: app-network  │ │
│  │                               │ │
│  │  ┌──────────┐  ┌──────────┐  │ │
│  │  │ Frontend │  │ Backend  │  │ │
│  │  │ nginx:80 │◄─┤ :8000    │  │ │
│  │  └─────┬────┘  └────┬─────┘  │ │
│  │        │            │        │ │
│  └────────┼────────────┼────────┘ │
│           │            │          │
│      Port 80      Port 8000       │
└───────────┼────────────┼──────────┘
            │            │
        Internet    API Clients
```

### Network Configuration
- **Driver**: Bridge network
- **Name**: rpn-calculator-network
- **DNS**: Automatic (frontend → backend by name)
- **Isolation**: Isolated from host and other networks
- **Security**: Internal communication only

### Port Mapping
| Service  | Internal Port | External Port | Purpose |
|----------|--------------|---------------|---------|
| Frontend | 80           | 80            | Web UI  |
| Backend  | 8000         | 8000          | REST API|

## 📦 Docker Compose Files

### docker-compose.yml (Production)
```yaml
Purpose: Standard production deployment
Features:
  - Optimized production builds
  - Health checks enabled
  - Restart policies
  - Port mappings
  - Environment variables
Use: make up
```

### docker-compose.dev.yml (Development)
```yaml
Purpose: Development with hot-reload
Features:
  - Source code mounted as volumes
  - Vite HMR for frontend
  - Uvicorn reload for backend
  - Debug logging
  - No build optimization
Use: make dev
```

### docker-compose.prod.yml (Production Advanced)
```yaml
Purpose: Production with resource limits
Features:
  - CPU and memory limits
  - Enhanced restart policies
  - Log rotation
  - Optional load balancer
  - Deploy constraints
Use: make prod
```

## 🔧 Environment Configuration

### Frontend Environment (.env)
```env
# Required
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Optional (production)
API_URL=http://backend:8000
NODE_ENV=production
```

### Backend Environment (rpn-calculator-api/.env)
```env
# Application
LOG_LEVEL=info|debug|warning|error
WORKERS=4|8|16

# API
API_PREFIX=/api/v1

# CORS
CORS_ORIGINS=http://localhost:5173,http://frontend
```

## 🏥 Health Checks

### Frontend Health Check
```yaml
healthcheck:
  test: wget --quiet --tries=1 --spider http://localhost/health
  interval: 30s
  timeout: 3s
  retries: 3
  start_period: 5s
```

### Backend Health Check
```yaml
healthcheck:
  test: python -c "import requests; requests.get('http://localhost:8000/health')"
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s
```

### Health Endpoints
- **Frontend**: `GET /health` → "healthy"
- **Backend**: `GET /health` → `{"status": "healthy", "service": "rpn-calculator-api"}`
- **Backend**: `GET /ready` → `{"status": "ready", "service": "rpn-calculator-api"}`

## 📊 Resource Management

### Production Resource Limits

#### Frontend
```yaml
resources:
  limits:
    cpus: '1'
    memory: 512M
  reservations:
    cpus: '0.25'
    memory: 128M
```

#### Backend
```yaml
resources:
  limits:
    cpus: '2'
    memory: 1G
  reservations:
    cpus: '0.5'
    memory: 256M
```

### Restart Policies
```yaml
restart_policy:
  condition: on-failure
  delay: 5s
  max_attempts: 3
  window: 120s
```

## 📝 Logging

### Configuration
```yaml
logging:
  driver: json-file
  options:
    max-size: 10m
    max-file: "3"
```

### Log Locations
- **Container logs**: `docker logs <container_name>`
- **Compose logs**: `docker-compose logs -f`
- **Host location**: `/var/lib/docker/containers/<id>/<id>-json.log`

## 🚀 Deployment Workflows

### Development Workflow
```bash
1. make dev
   → Builds dev images
   → Starts containers with hot-reload
   → Mounts source code as volumes
   → Frontend: localhost:5173
   → Backend: localhost:8000

2. Code changes auto-reload
   → Frontend: Vite HMR
   → Backend: Uvicorn --reload

3. make dev-down
   → Stops containers
   → Keeps volumes for next run
```

### Production Workflow
```bash
1. make build
   → Builds optimized images
   → Multi-stage builds
   → No cache

2. make up
   → Starts production containers
   → Detached mode (-d)
   → Health checks active
   → Frontend: localhost:80
   → Backend: localhost:8000

3. make logs
   → View running logs

4. make health
   → Check service health

5. make down
   → Graceful shutdown
   → Removes containers
```

### CI/CD Workflow
```bash
1. Build images
   docker-compose -f docker-compose.yml build

2. Run tests
   docker-compose exec backend pytest

3. Tag images
   docker tag rpn-frontend:latest registry/rpn-frontend:v1.0.0

4. Push to registry
   docker push registry/rpn-frontend:v1.0.0

5. Deploy to production
   docker stack deploy -c docker-compose.prod.yml rpn
```

## 🔒 Security Best Practices

### Implemented
- ✅ **Non-root containers**: Both containers run as non-root users
- ✅ **Multi-stage builds**: No build tools in production
- ✅ **Minimal base images**: Alpine and slim variants
- ✅ **No secrets in images**: Environment variables only
- ✅ **Security headers**: X-Frame-Options, CSP, etc.
- ✅ **Health checks**: Automated container monitoring
- ✅ **Resource limits**: Prevent resource exhaustion

### Recommended for Production
- ⚠️ **HTTPS/TLS**: Configure SSL certificates
- ⚠️ **Secrets management**: Use Docker secrets or Vault
- ⚠️ **Image scanning**: Scan for vulnerabilities (Trivy, Snyk)
- ⚠️ **Network policies**: Restrict container communication
- ⚠️ **Read-only filesystem**: Where possible
- ⚠️ **Regular updates**: Keep base images updated

## 📈 Scaling Strategies

### Horizontal Scaling (Docker Swarm)
```bash
# Scale backend to 5 replicas
docker service scale rpn-calculator_backend=5

# Scale frontend to 3 replicas
docker service scale rpn-calculator_frontend=3
```

### Load Balancer Configuration
```nginx
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

upstream frontend {
    server frontend1:80;
    server frontend2:80;
}
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rpn-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rpn-backend
  template:
    spec:
      containers:
      - name: backend
        image: rpn-backend:latest
        ports:
        - containerPort: 8000
```

## 🔍 Monitoring & Observability

### Metrics to Track
- Container CPU/Memory usage
- Request count and latency
- Error rates
- Health check success rate
- Image pull time
- Container restart count

### Tools Integration
```yaml
# Prometheus metrics endpoint
GET /metrics

# Health endpoints
GET /health
GET /ready

# Logs
docker logs --tail 100 -f <container>
```

## 💡 Best Practices Checklist

### Development
- [x] Hot-reload enabled
- [x] Source code mounted as volumes
- [x] Debug logging active
- [x] Fast rebuild times
- [x] Easy to restart services

### Production
- [x] Multi-stage builds
- [x] Non-root users
- [x] Health checks configured
- [x] Resource limits set
- [x] Logging configured
- [x] Restart policies defined
- [x] Security headers enabled
- [x] Minimal image size

### DevOps
- [x] Makefile for common tasks
- [x] .dockerignore optimized
- [x] .env.example provided
- [x] Documentation complete
- [x] CI/CD ready

---

**Architecture Version**: 1.0.0
**Last Updated**: 2024
**Reviewed By**: CTO Level Architecture Review
