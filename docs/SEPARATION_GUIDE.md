# Guide de Séparation Frontend/Backend - CTO Level

## 🚨 Problème Actuel

**Structure actuelle** :
```
project/                        ← Repository Git
├── src/                       ← Frontend
├── rpn-calculator-api/        ← Backend DANS le frontend
├── docker-compose.yml
└── package.json
```

**Problème** : Le backend est imbriqué dans le projet frontend. Ce n'est **PAS une séparation propre**.

---

## ✅ Solution 1: Structure Monorepo (Recommandée pour ce projet)

### Avantages
- ✅ Un seul repository
- ✅ Déploiement coordonné facile
- ✅ Partage de configuration
- ✅ CI/CD centralisé

### Structure cible
```
rpn-calculator/                        # Root du monorepo
│
├── apps/                              # Applications
│   ├── frontend/                      # Application frontend
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── backend/                       # Application backend
│       ├── app/
│       ├── Dockerfile
│       ├── requirements.txt
│       └── README.md
│
├── deployment/                        # Configuration déploiement
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.dev.yml
│   │   └── docker-compose.prod.yml
│   ├── k8s/                          # Kubernetes (optionnel)
│   └── terraform/                    # IaC (optionnel)
│
├── docs/                              # Documentation
│   ├── architecture/
│   ├── api/
│   └── deployment/
│
├── scripts/                           # Scripts utilitaires
│   ├── migrate.sh
│   └── setup.sh
│
└── .github/                          # CI/CD
    └── workflows/
        ├── frontend.yml
        └── backend.yml
```

### Comment migrer

1. **Créer la nouvelle structure**
```bash
mkdir -p apps/{frontend,backend} deployment/docker docs scripts
```

2. **Déplacer le frontend**
```bash
# Copier (ne pas déplacer encore)
cp -r src apps/frontend/
cp -r public apps/frontend/
cp package.json apps/frontend/
cp Dockerfile apps/frontend/
# etc...
```

3. **Déplacer le backend**
```bash
cp -r rpn-calculator-api/* apps/backend/
```

4. **Mettre à jour docker-compose.yml**
```yaml
# deployment/docker/docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ../../apps/frontend    # Chemin relatif
      dockerfile: Dockerfile
    container_name: rpn-frontend
    ports:
      - "80:80"

  backend:
    build:
      context: ../../apps/backend     # Chemin relatif
      dockerfile: Dockerfile
    container_name: rpn-backend
    ports:
      - "8000:8000"
```

5. **Créer un Makefile root**
```makefile
# Makefile à la racine
.PHONY: help dev prod clean

help:
	@echo "RPN Calculator - Monorepo"
	@echo ""
	@echo "Commands:"
	@echo "  make dev     - Start development"
	@echo "  make prod    - Start production"
	@echo "  make clean   - Clean everything"

dev:
	cd deployment/docker && docker-compose -f docker-compose.dev.yml up

prod:
	cd deployment/docker && docker-compose -f docker-compose.yml up -d

clean:
	cd deployment/docker && docker-compose down -v
```

---

## ✅ Solution 2: Deux Repositories Séparés (Production Enterprise)

### Avantages
- ✅ Isolation complète
- ✅ Permissions Git séparées
- ✅ Versions indépendantes
- ✅ Équipes autonomes
- ✅ CI/CD indépendant

### Structure

**Repository 1: rpn-calculator-frontend**
```
rpn-calculator-frontend/
├── src/
├── public/
├── Dockerfile
├── package.json
├── nginx.conf
├── .github/
│   └── workflows/
│       └── ci.yml
└── README.md
```

**Repository 2: rpn-calculator-backend**
```
rpn-calculator-backend/
├── app/
├── tests/
├── Dockerfile
├── requirements.txt
├── pyproject.toml
├── .github/
│   └── workflows/
│       └── ci.yml
└── README.md
```

**Repository 3: rpn-calculator-infra** (optionnel)
```
rpn-calculator-infra/
├── docker-compose/
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
├── kubernetes/
│   ├── frontend-deployment.yaml
│   └── backend-deployment.yaml
├── terraform/
└── ansible/
```

### Comment créer

1. **Créer repository frontend**
```bash
mkdir rpn-calculator-frontend
cd rpn-calculator-frontend
git init

# Copier les fichiers frontend uniquement
cp -r ../project/src .
cp -r ../project/public .
cp ../project/package.json .
cp ../project/Dockerfile .
# etc...

git add .
git commit -m "Initial frontend commit"
git remote add origin git@github.com:vous/rpn-calculator-frontend.git
git push -u origin main
```

2. **Créer repository backend**
```bash
mkdir rpn-calculator-backend
cd rpn-calculator-backend
git init

# Copier les fichiers backend uniquement
cp -r ../project/rpn-calculator-api/* .

git add .
git commit -m "Initial backend commit"
git remote add origin git@github.com:vous/rpn-calculator-backend.git
git push -u origin main
```

3. **Docker Compose séparé**
```yaml
# Dans un repo d'infra ou localement
version: '3.8'

services:
  frontend:
    image: ghcr.io/vous/rpn-calculator-frontend:latest
    ports:
      - "80:80"

  backend:
    image: ghcr.io/vous/rpn-calculator-backend:latest
    ports:
      - "8000:8000"
```

---

## 🎯 Quelle solution choisir ?

### Monorepo SI :
- ✅ Une seule équipe
- ✅ Déploiements synchronisés
- ✅ Développement coordonné
- ✅ Partage de code commun
- ✅ Simplicité de gestion

**👉 RECOMMANDÉ pour votre projet actuel**

### Repos séparés SI :
- ✅ Équipes distinctes (frontend/backend)
- ✅ Cycles de release différents
- ✅ Versions indépendantes requises
- ✅ Permissions différentes
- ✅ Scale différent (ex: 10 devs frontend, 3 backend)

**👉 Pour une grande organisation**

---

## 🚀 Script de Migration Monorepo

Créez ce script pour automatiser la migration :

```bash
#!/bin/bash
# migrate-to-monorepo.sh

set -e

echo "🔄 Migration vers structure Monorepo..."

# Backup
echo "📦 Creating backup..."
cp -r . ../project-backup-$(date +%Y%m%d)

# Create structure
echo "📁 Creating monorepo structure..."
mkdir -p apps/{frontend,backend}
mkdir -p deployment/docker
mkdir -p docs/{architecture,api,deployment}
mkdir -p scripts

# Move frontend
echo "🎨 Moving frontend..."
mv src apps/frontend/
mv public apps/frontend/ 2>/dev/null || true
mv index.html apps/frontend/
mv package.json apps/frontend/
mv package-lock.json apps/frontend/
mv vite.config.ts apps/frontend/
mv tsconfig*.json apps/frontend/
mv tailwind.config.js apps/frontend/
mv postcss.config.js apps/frontend/
mv eslint.config.js apps/frontend/
mv nginx.conf apps/frontend/

# Copy frontend Dockerfile
cp Dockerfile apps/frontend/
cp .env.example apps/frontend/ 2>/dev/null || true

# Move backend
echo "⚙️  Moving backend..."
mv rpn-calculator-api/* apps/backend/
rmdir rpn-calculator-api

# Move deployment
echo "🚀 Moving deployment configs..."
mv docker-compose*.yml deployment/docker/
mv Makefile deployment/docker/ 2>/dev/null || true

# Move docs
echo "📚 Moving documentation..."
mv *.md docs/ 2>/dev/null || true

# Create new READMEs
echo "📝 Creating READMEs..."

cat > README.md << 'EOF'
# RPN Calculator - Monorepo

This is a monorepo containing the frontend and backend for the RPN Calculator.

## Structure
- `apps/frontend` - React + TypeScript frontend
- `apps/backend` - FastAPI backend
- `deployment/docker` - Docker configurations
- `docs/` - Documentation

## Quick Start
\`\`\`bash
cd deployment/docker
make dev
\`\`\`

See docs/deployment/DEPLOYMENT.md for details.
EOF

cat > apps/frontend/README.md << 'EOF'
# RPN Calculator - Frontend

React + TypeScript frontend with modern UI.

## Development
\`\`\`bash
npm install
npm run dev
\`\`\`

## Build
\`\`\`bash
npm run build
\`\`\`
EOF

cat > apps/backend/README.md << 'EOF'
# RPN Calculator - Backend

FastAPI backend with clean architecture.

## Development
\`\`\`bash
pip install -r requirements.txt
uvicorn app.main:app --reload
\`\`\`

## Tests
\`\`\`bash
pytest
\`\`\`
EOF

# Update docker-compose paths
echo "🔧 Updating docker-compose paths..."
sed -i 's|context: \.|context: ../../apps/frontend|g' deployment/docker/docker-compose.yml
sed -i 's|context: ./rpn-calculator-api|context: ../../apps/backend|g' deployment/docker/docker-compose.yml

# Create root Makefile
cat > Makefile << 'EOF'
.PHONY: help dev prod stop clean

help:
	@echo "RPN Calculator Monorepo"
	@echo ""
	@echo "Commands:"
	@echo "  make dev     - Start development environment"
	@echo "  make prod    - Start production environment"
	@echo "  make stop    - Stop all services"
	@echo "  make clean   - Clean Docker resources"

dev:
	cd deployment/docker && docker-compose -f docker-compose.dev.yml up

prod:
	cd deployment/docker && docker-compose up -d

stop:
	cd deployment/docker && docker-compose down

clean:
	cd deployment/docker && docker-compose down -v --rmi all
EOF

echo "✅ Migration complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Review the new structure in apps/"
echo "  2. Update any hardcoded paths in your code"
echo "  3. Test: make dev"
echo "  4. Commit the changes: git add . && git commit -m 'Restructure as monorepo'"
```

Rendez-le exécutable et lancez-le :
```bash
chmod +x migrate-to-monorepo.sh
./migrate-to-monorepo.sh
```

---

## 📊 Comparaison Visuelle

### AVANT (Actuel) ❌
```
project/
├── src/              ← Frontend
├── rpn-calculator-api/   ← Backend imbriqué!
│   ├── app/
│   └── tests/
├── Dockerfile        ← Lequel? Frontend!
└── package.json      ← Frontend
```
**Problème**: Confusion, pas de séparation claire

### APRÈS (Monorepo) ✅
```
rpn-calculator/
├── apps/
│   ├── frontend/     ← Projet frontend complet
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── backend/      ← Projet backend complet
│       ├── app/
│       ├── Dockerfile
│       └── requirements.txt
└── deployment/
    └── docker/
        └── docker-compose.yml
```
**Avantage**: Séparation claire, chaque app est autonome

---

## 🎓 Recommandation CTO

Pour **votre projet actuel**, je recommande :

1. **Utiliser la structure Monorepo**
   - Plus simple pour un seul développeur/équipe
   - Coordination facile
   - Un seul repo Git

2. **Migrer avec le script fourni**
   - Automatisé, sûr (avec backup)
   - Prend 2 minutes

3. **Garder docker-compose centralisé**
   - Dans `deployment/docker/`
   - Références relatives aux apps

4. **Documenter la nouvelle structure**
   - README à la racine
   - README dans chaque app

---

**La séparation actuelle n'est effectivement pas correcte. Le backend ne devrait JAMAIS être un sous-dossier du frontend. Utilisez ce guide pour restructurer proprement!**
