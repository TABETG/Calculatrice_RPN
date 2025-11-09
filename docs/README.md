# RPN Calculator - Production-Ready Full Stack Application

[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)

A production-grade Reverse Polish Notation (RPN) calculator with a modern web interface and RESTful API.

## 🌟 Features

### Frontend (React + TypeScript)
- ✅ Modern glassmorphism design with dark/light themes
- ✅ Real-time toast notifications (success, error, warning, info)
- ✅ Advanced operations: sqrt, power, swap, dup, drop
- ✅ Undo functionality with full history
- ✅ Current result prominently displayed
- ✅ Complete ARIA accessibility (WCAG AA compliant)
- ✅ Responsive design for all screen sizes
- ✅ Frontend validation (NaN, Infinity, empty fields)
- ✅ Supabase database integration

### Backend (Python + FastAPI)
- ✅ Clean architecture (Domain/Service/API layers)
- ✅ Type-safe with 100% type hints
- ✅ 10 operations (4 basic + 6 advanced)
- ✅ Multi-session support
- ✅ History tracking with undo
- ✅ Comprehensive error handling
- ✅ OpenAPI/Swagger documentation
- ✅ Health check endpoints
- ✅ Production-ready tooling (black, ruff, mypy, pytest)

### DevOps
- ✅ Multi-stage Docker builds
- ✅ Docker Compose for dev and prod
- ✅ Nginx reverse proxy
- ✅ Health checks and monitoring
- ✅ Resource limits and auto-restart
- ✅ Hot-reload for development
- ✅ Makefile for easy management

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum

### Run with Docker (Recommended)

```bash
# 1. Clone the repository
git clone <repository-url>
cd project

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Start application
make up

# Access services:
# - Frontend: http://localhost
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

### Development Mode (Hot Reload)

```bash
# Start development environment
make dev

# Access services:
# - Frontend: http://localhost:5173 (Vite with HMR)
# - Backend: http://localhost:8000 (Auto-reload)
```

## 📖 Documentation

- [Deployment Guide](DEPLOYMENT.md) - Complete deployment instructions
- [Backend Improvements](rpn-calculator-api/IMPROVEMENTS_SUMMARY.md) - Backend architecture details
- [Final Improvements](FINAL_IMPROVEMENTS.md) - All improvements summary
- [API Documentation](http://localhost:8000/docs) - Interactive Swagger UI (when running)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Load Balancer                  │
│             (Nginx - Optional)              │
└──────────────────┬──────────────────────────┘
                   │
      ┌────────────┴─────────────┐
      │                          │
┌─────▼──────┐           ┌──────▼──────┐
│  Frontend  │           │   Backend   │
│  (React)   │ ◄────────►│  (FastAPI)  │
│  + Nginx   │           │  + Uvicorn  │
│  Port 80   │           │  Port 8000  │
└─────┬──────┘           └──────┬──────┘
      │                         │
      └──────────┬──────────────┘
                 │
         ┌───────▼────────┐
         │  Supabase DB   │
         │   (External)   │
         └────────────────┘
```

### Technology Stack

**Frontend**
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Supabase client for database
- Custom hooks for state management
- Nginx for production serving

**Backend**
- Python 3.11
- FastAPI framework
- Uvicorn ASGI server
- Pydantic for validation
- Pytest for testing
- Type hints with mypy

**Database**
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Real-time capabilities

**DevOps**
- Docker multi-stage builds
- Docker Compose orchestration
- Nginx reverse proxy
- Health checks
- Logging and monitoring

## 📊 Operations

### Basic Operations
- **Addition** (+)
- **Subtraction** (-)
- **Multiplication** (*)
- **Division** (/)

### Advanced Operations
- **Square Root** (√)
- **Power** (x^y)
- **Swap** - Exchange top two elements
- **Duplicate** - Copy top element
- **Drop** - Remove top element
- **Undo** - Restore previous state

## 🔧 Makefile Commands

```bash
# Development
make dev          # Start dev environment with hot-reload
make dev-logs     # View development logs
make dev-down     # Stop development

# Production
make build        # Build production images
make up           # Start production environment
make down         # Stop production
make restart      # Restart all services
make logs         # View logs

# Utilities
make ps           # List containers
make health       # Check service health
make clean        # Remove all Docker resources
make test         # Run tests
make shell-backend    # Backend shell
make shell-frontend   # Frontend shell
```

## 🧪 Testing

```bash
# Run all tests
make test

# Or manually
cd rpn-calculator-api
pytest --cov --cov-report=html
```

## 🔒 Security

- ✅ Non-root containers
- ✅ Multi-stage builds (minimal attack surface)
- ✅ Health checks
- ✅ Resource limits
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ CORS configuration
- ⚠️ HTTPS required for production (configure SSL)
- ⚠️ Authentication required for production (implement JWT)

## 📈 Performance

### Frontend
- Optimized bundle size: ~295KB JS + ~25KB CSS
- Code splitting ready
- Lazy loading components
- Efficient re-renders with React hooks

### Backend
- Async/await throughout
- Multi-worker support (4-8 workers)
- In-memory stack with optional persistence
- O(1) operations

### Docker
- Multi-stage builds (smaller images)
- Layer caching optimization
- Alpine-based images where possible

## 🌍 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (rpn-calculator-api/.env)
```env
LOG_LEVEL=info
WORKERS=4
API_PREFIX=/api/v1
```

## 📝 Project Structure

```
project/
├── src/                      # Frontend source
│   ├── components/          # React components
│   ├── hooks/              # Custom hooks
│   ├── services/           # API services
│   └── lib/                # Utilities
├── rpn-calculator-api/     # Backend source
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── core/          # Config & exceptions
│   │   ├── domain/        # Business logic
│   │   └── services/      # Service layer
│   └── tests/             # Backend tests
├── Dockerfile             # Frontend production
├── docker-compose.yml     # Production compose
├── docker-compose.dev.yml # Dev compose
├── Makefile              # Command shortcuts
└── DEPLOYMENT.md         # Deployment guide
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

### Code Quality

```bash
# Format code
black .
isort .

# Lint
ruff check .

# Type check
mypy .

# Test
pytest --cov
```

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- FastAPI for the excellent Python framework
- React team for the powerful UI library
- Supabase for the backend infrastructure
- Docker for containerization

## 📞 Support

For issues, questions, or contributions:
1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
2. Review [FINAL_IMPROVEMENTS.md](FINAL_IMPROVEMENTS.md) for architecture
3. Open an issue on the repository

---

**Built with ❤️ using modern best practices and production-ready patterns**
