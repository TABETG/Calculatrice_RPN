# Guide d'installation rapide

## Commandes d'installation et de test

### 1. Installation des dépendances

```bash
# Avec pip
pip install -r requirements.txt

# Ou avec pip3
pip3 install -r requirements.txt
```

### 2. Lancer les tests

```bash
# Tests complets
pytest

# Tests avec verbosité
pytest -v

# Tests avec couverture
pytest --cov=app --cov-report=html
```

### 3. Lancer le serveur

```bash
# Mode développement (avec reload automatique)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Ou directement avec Python
python -m uvicorn app.main:app --reload
```

### 4. Accéder à l'interface Swagger

Une fois le serveur démarré :
- Swagger UI : http://localhost:8000/docs
- ReDoc : http://localhost:8000/redoc
- OpenAPI JSON : http://localhost:8000/openapi.json

## Test rapide de l'API

```bash
# Health check
curl http://localhost:8000/

# Ajouter des valeurs
curl -X POST http://localhost:8000/stack -H "Content-Type: application/json" -d '{"value": 5}'
curl -X POST http://localhost:8000/stack -H "Content-Type: application/json" -d '{"value": 3}'

# Addition
curl -X POST http://localhost:8000/op/add

# Voir la pile
curl http://localhost:8000/stack

# Vider la pile
curl -X DELETE http://localhost:8000/stack
```

## Vérification de l'installation

Si tout est correctement installé, les tests devraient tous passer :

```bash
pytest -v
```

Résultat attendu : `90+ tests passed`
