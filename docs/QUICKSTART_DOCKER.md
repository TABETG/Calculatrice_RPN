# Quick Start Guide - Docker Deployment

## 🚀 5-Minute Setup

### Step 1: Prerequisites
```bash
# Verify Docker installation
docker --version        # Should be 20.10+
docker-compose --version  # Should be 2.0+
```

### Step 2: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit with your Supabase credentials
nano .env  # or use your favorite editor
```

Required in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Start Application
```bash
# Production mode
make up

# OR Development mode (with hot-reload)
make dev
```

### Step 4: Access Application
- **Frontend**: http://localhost (production) or http://localhost:5173 (dev)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📋 Common Commands

### Development
```bash
make dev          # Start dev with hot-reload
make dev-logs     # Watch logs
make dev-down     # Stop dev environment
```

### Production
```bash
make build        # Build images
make up           # Start services
make logs         # View logs
make down         # Stop services
make restart      # Restart all
```

### Debugging
```bash
make ps           # List containers
make health       # Check health
make shell-backend   # Backend shell
make shell-frontend  # Frontend shell
```

## 🔍 Verify Installation

```bash
# Check if services are running
make ps

# Test backend health
curl http://localhost:8000/health

# Test frontend health
curl http://localhost/health

# View application
open http://localhost  # macOS
xdg-open http://localhost  # Linux
```

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Kill process on port 80
lsof -ti:80 | xargs kill -9

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Services Won't Start
```bash
# Clean everything and start fresh
make clean
make build
make up
```

### View Error Logs
```bash
# All services
make logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
```

### Rebuild from Scratch
```bash
# Complete rebuild
make clean
docker system prune -a  # Remove all images
make build --no-cache
make up
```

## 📚 Next Steps

1. **Read Full Documentation**: [DEPLOYMENT.md](DEPLOYMENT.md)
2. **Understand Architecture**: [DOCKER_ARCHITECTURE.md](DOCKER_ARCHITECTURE.md)
3. **Review Summary**: [DOCKER_SUMMARY.md](DOCKER_SUMMARY.md)

## 🎓 Learn More

- Docker Docs: https://docs.docker.com
- Nginx Config: https://nginx.org/en/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- React Docs: https://react.dev

---

**Ready in 5 minutes!** 🎉
