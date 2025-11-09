.PHONY: help dev prod stop clean logs ps health build

help:
	@echo "RPN Calculator - Monorepo"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev          - Start development environment with hot-reload"
	@echo "  make dev-logs     - View development logs"
	@echo "  make dev-down     - Stop development environment"
	@echo ""
	@echo "Production Commands:"
	@echo "  make build        - Build production images"
	@echo "  make prod         - Start production environment"
	@echo "  make stop         - Stop production environment"
	@echo "  make restart      - Restart production environment"
	@echo "  make logs         - View production logs"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make clean        - Remove all Docker resources"
	@echo "  make ps           - List running containers"
	@echo "  make health       - Check health of services"

# Development commands
dev:
	@echo "Starting development environment..."
	cd deployment/docker && docker-compose -f docker-compose.dev.yml up --build

dev-logs:
	cd deployment/docker && docker-compose -f docker-compose.dev.yml logs -f

dev-down:
	cd deployment/docker && docker-compose -f docker-compose.dev.yml down

# Production commands
build:
	@echo "Building production images..."
	cd deployment/docker && docker-compose build --no-cache

prod:
	@echo "Starting production environment..."
	cd deployment/docker && docker-compose up -d

stop:
	@echo "Stopping production environment..."
	cd deployment/docker && docker-compose down

restart:
	@echo "Restarting production environment..."
	cd deployment/docker && docker-compose restart

logs:
	cd deployment/docker && docker-compose logs -f

# Utility commands
clean:
	@echo "Cleaning up Docker resources..."
	cd deployment/docker && docker-compose down -v --rmi all --remove-orphans
	docker system prune -f

ps:
	cd deployment/docker && docker-compose ps

health:
	@echo "Checking backend health..."
	@curl -f http://localhost:8000/health || echo "Backend unhealthy"
	@echo ""
	@echo "Checking frontend health..."
	@curl -f http://localhost/health || echo "Frontend unhealthy"
