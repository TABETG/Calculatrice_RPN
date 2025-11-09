# 🚀 Quick Start - RPN Calculator API

Guide ultra-rapide pour tester l'application en 2 minutes.

## Installation en 30 secondes

```bash
# 1. Cloner le repo (remplacer par votre URL)
git clone <votre-repo-url>
cd rpn-calculator-api

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Lancer le serveur
uvicorn app.main:app --reload
```

 Le serveur est maintenant disponible sur http://localhost:8000

## Tester avec Swagger (interface graphique)

1. Ouvrir http://localhost:8000/docs dans votre navigateur
2. Essayer les endpoints interactivement :
   - Cliquer sur un endpoint (ex: `POST /stack`)
   - Cliquer sur "Try it out"
   - Remplir les paramètres
   - Cliquer sur "Execute"

## Exemple rapide en ligne de commande

```bash
# 1. Ajouter deux nombres
curl -X POST http://localhost:8000/stack -H "Content-Type: application/json" -d '{"value": 10}'
curl -X POST http://localhost:8000/stack -H "Content-Type: application/json" -d '{"value": 5}'

# 2. Les additionner
curl -X POST http://localhost:8000/op/add

# Résultat attendu : {"result": 15.0, "stack": [15.0]}
```

## Exemple RPN : (5 + 3) × 2 = 16

```bash
# En RPN : 5 3 + 2 *
curl -X POST http://localhost:8000/stack -d '{"value": 5}' -H "Content-Type: application/json"
curl -X POST http://localhost:8000/stack -d '{"value": 3}' -H "Content-Type: application/json"
curl -X POST http://localhost:8000/op/add
curl -X POST http://localhost:8000/stack -d '{"value": 2}' -H "Content-Type: application/json"
curl -X POST http://localhost:8000/op/mul

# Résultat final : 16
```

## Lancer les tests

```bash
pytest -v
```

 Tous les tests doivent passer (90+ tests)

## Endpoints disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/docs` | GET | Interface Swagger (recommandé) |
| `/stack` | POST | Ajouter un nombre |
| `/stack` | GET | Voir la pile |
| `/stack` | DELETE | Vider la pile |
| `/op/add` | POST | Addition (a + b) |
| `/op/sub` | POST | Soustraction (a - b) |
| `/op/mul` | POST | Multiplication (a × b) |
| `/op/div` | POST | Division (a ÷ b) |

## Fichiers importants

-  **README.md** : Documentation complète
-  **todo.md** : Améliorations techniques
- ️ **roadmap.md** : Vision produit
-  **tests/** : Suite de tests complète

## Besoin d'aide ?

Consulter le **README.md** pour plus de détails.

---

Vous êtes prêt à utiliser la calculatrice RPN !
