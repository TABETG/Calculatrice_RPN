# RPN Calculator - Backend

FastAPI backend with clean architecture and Docker deployment.

## 🚀 Quick Start

### Development
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Access at: http://localhost:8000

### Tests
```bash
pytest --cov
```

### Docker
```bash
docker build -t rpn-backend .
docker run -p 8000:8000 rpn-backend
```

##  Structure

```
backend/
├── app/
│   ├── api/           # API routes
│   ├── core/          # Config & exceptions
│   ├── domain/        # Business logic
│   ├── services/      # Service layer
│   └── main.py        # Entry point
├── tests/            # Tests
├── Dockerfile        # Production
├── Dockerfile.dev    # Development
├── requirements.txt  # Dependencies
└── pyproject.toml   # Tooling config
```

##  API Endpoints

- `GET /` - Root
- `GET /health` - Health check
- `GET /ready` - Readiness check
- `GET /api/v1/stack` - Get stack
- `POST /api/v1/stack` - Push value
- `DELETE /api/v1/stack` - Clear stack
- `POST /api/v1/stack/{operation}` - Perform operation

See `/docs` for interactive API documentation.

##  Operations

**Basic**: add, subtract, multiply, divide  
**Advanced**: sqrt, power, swap, dup, drop

##  Code Quality

```bash
black .          # Format
ruff check .     # Lint
mypy .           # Type check
pytest --cov     # Test
```

##  Technologies

- Python 3.11
- FastAPI
- Uvicorn
- Pydantic
- Pytest
