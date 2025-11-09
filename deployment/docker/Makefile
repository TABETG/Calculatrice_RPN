.PHONY: help build up down logs restart clean test dev prod

# Default target
help:
	@echo "RPN Calculator - Docker Management"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev          - Start development environment with hot-reload"
	@echo "  make dev-logs     - View development logs"
	@echo "  make dev-down     - Stop development environment"
	@echo ""
	@echo "Production Commands:"
	@echo "  make build        - Build production images"
	@echo "  make up           - Start production environment"
	@echo "  make down         - Stop production environment"
	@echo "  make restart      - Restart production environment"
	@echo "  make logs         - View production logs"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make clean        - Remove all containers, images, and volumes"
	@echo "  make test         - Run tests in containers"
	@echo "  make shell-backend  - Open shell in backend container"
	@echo "  make shell-frontend - Open shell in frontend container"
	@echo "  make ps           - List running containers"
	@echo "  make health       - Check health of all services"

# Development commands
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

dev-down:
	docker-compose -f docker-compose.dev.yml down

# Production commands
build:
	@echo "Building production images..."
	docker-compose -f docker-compose.yml build --no-cache

up:
	@echo "Starting production environment..."
	docker-compose -f docker-compose.yml up -d

down:
	@echo "Stopping production environment..."
	docker-compose -f docker-compose.yml down

restart:
	@echo "Restarting production environment..."
	docker-compose -f docker-compose.yml restart

logs:
	docker-compose -f docker-compose.yml logs -f

# Utility commands
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose -f docker-compose.yml down -v --rmi all --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --rmi all --remove-orphans
	docker system prune -f

test:
	@echo "Running tests..."
	docker-compose -f docker-compose.yml exec backend pytest --cov

shell-backend:
	docker-compose -f docker-compose.yml exec backend /bin/bash

shell-frontend:
	docker-compose -f docker-compose.yml exec frontend /bin/sh

ps:
	docker-compose -f docker-compose.yml ps

health:
	@echo "Checking backend health..."
	@curl -f http://localhost:8000/health || echo "Backend unhealthy"
	@echo ""
	@echo "Checking frontend health..."
	@curl -f http://localhost/health || echo "Frontend unhealthy"

# Production deployment
prod:
	@echo "Deploying production environment..."
	docker-compose -f docker-compose.prod.yml up -d --build

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f
