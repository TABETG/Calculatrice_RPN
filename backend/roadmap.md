# Roadmap - Backlog produit

Ce document présente une roadmap structurée pour l'évolution de la calculatrice RPN vers une application production-ready et riche en fonctionnalités.

##  Vision produit

Transformer la calculatrice RPN en une plateforme complète offrant :
- Calculs RPN avancés avec historique
- Multi-utilisateurs avec authentification
- Interface web moderne
- API publique documentée
- Haute disponibilité et performance

##  Phases de développement

---

## Phase 1 : Production Ready (3-4 semaines)

### Sprint 1 : Infrastructure & Persistance

**Objectif** : Rendre l'application déployable en production

#### US-001 : Persistance Redis
**En tant qu'** utilisateur
**Je veux** que mes piles soient sauvegardées
**Afin de** ne pas perdre mes calculs en cas de redémarrage du serveur

**Critères d'acceptation :**
- Les piles sont stockées dans Redis avec TTL configurable
- Chaque utilisateur peut avoir plusieurs piles nommées
- Performance < 50ms pour push/pop
- Tests de persistance ajoutés

**Effort estimé :** 5 points

#### US-002 : Dockerisation complète
**En tant que** DevOps
**Je veux** des containers Docker
**Afin de** déployer facilement l'application

**Critères d'acceptation :**
- Dockerfile multi-stage optimisé (< 100MB)
- docker-compose pour dev (app + Redis + monitoring)
- Variables d'environnement documentées
- Image publiée sur Docker Hub

**Effort estimé :** 3 points

#### US-003 : Configuration externalisée
**En tant que** développeur
**Je veux** externaliser la configuration
**Afin de** gérer différents environnements (dev/staging/prod)

**Critères d'acceptation :**
- Fichier `.env` pour config locale
- Pydantic Settings pour validation
- Support de 12-factor app
- Documentation des variables d'env

**Effort estimé :** 2 points

---

### Sprint 2 : Observabilité & CI/CD

#### US-004 : Logging structuré
**En tant qu'** opérateur
**Je veux** des logs structurés
**Afin de** débugger efficacement en production

**Critères d'acceptation :**
- Logs au format JSON avec correlation IDs
- Niveaux de log configurables (DEBUG, INFO, WARNING, ERROR)
- Log des requêtes HTTP (durée, status, endpoint)
- Rotation des logs automatique

**Effort estimé :** 3 points

#### US-005 : Pipeline CI/CD
**En tant que** développeur
**Je veux** un pipeline CI/CD automatisé
**Afin de** déployer rapidement et en sécurité

**Critères d'acceptation :**
- GitHub Actions configuré
- Lint (black, flake8, mypy) automatique
- Tests automatiques sur chaque PR
- Build Docker et push registry sur merge main
- Déploiement automatique vers staging

**Effort estimé :** 5 points

#### US-006 : Métriques et monitoring
**En tant qu'** opérateur
**Je veux** des métriques applicatives
**Afin de** surveiller la santé du système

**Critères d'acceptation :**
- Endpoint `/metrics` avec format Prometheus
- Métriques : nb requêtes, latence p50/p95/p99, erreurs
- Dashboard Grafana de base
- Alertes sur taux d'erreur > 5%

**Effort estimé :** 5 points

---

## Phase 2 : Sécurité & Multi-utilisateurs (2-3 semaines)

### Sprint 3 : Authentification

#### US-007 : Système d'authentification JWT
**En tant qu'** utilisateur
**Je veux** créer un compte et me connecter
**Afin de** sauvegarder mes piles personnelles

**Critères d'acceptation :**
- Endpoints `/auth/register` et `/auth/login`
- JWT avec refresh token
- Hash bcrypt des mots de passe
- Expiration token configurable
- Tests d'authentification

**Effort estimé :** 8 points

#### US-008 : Gestion des piles utilisateur
**En tant qu'** utilisateur authentifié
**Je veux** gérer plusieurs piles nommées
**Afin de** organiser mes calculs

**Critères d'acceptation :**
- `POST /stacks/{name}` pour créer une pile nommée
- `GET /stacks` pour lister mes piles
- `DELETE /stacks/{name}` pour supprimer
- Isolation des données entre utilisateurs
- Limite de 10 piles par utilisateur

**Effort estimé :** 5 points

---

### Sprint 4 : Sécurité renforcée

#### US-009 : Rate limiting
**En tant que** système
**Je veux** limiter les requêtes abusives
**Afin de** protéger l'infrastructure

**Critères d'acceptation :**
- Rate limiting par IP : 100 req/min
- Rate limiting par user authentifié : 500 req/min
- Header `X-RateLimit-*` dans les réponses
- Code 429 Too Many Requests avec Retry-After

**Effort estimé :** 3 points

#### US-010 : Validation renforcée
**En tant que** système
**Je veux** valider strictement les inputs
**Afin d'** éviter les abus et bugs

**Critères d'acceptation :**
- Limite de taille de pile : 1000 éléments max
- Validation des nombres : -1e308 à +1e308
- Rejet des NaN, Infinity
- Messages d'erreur clairs
- Tests sur cas limites

**Effort estimé :** 3 points

#### US-011 : Audit de sécurité
**En tant que** équipe
**Je veux** un audit de sécurité
**Afin de** identifier les vulnérabilités

**Critères d'acceptation :**
- Scan avec Bandit (SAST)
- Scan des dépendances (Snyk/Safety)
- Analyse OWASP Top 10
- Rapport de sécurité généré
- Correctifs appliqués sur vulns critiques

**Effort estimé :** 5 points

---

## Phase 3 : Fonctionnalités avancées (4-5 semaines)

### Sprint 5 : Historique & Undo

#### US-012 : Historique des opérations
**En tant qu'** utilisateur
**Je veux** voir l'historique de mes opérations
**Afin de** comprendre comment j'ai obtenu un résultat

**Critères d'acceptation :**
- `GET /stacks/{name}/history` retourne les 50 dernières opérations
- Format : timestamp, opération, valeurs avant/après
- Pagination supportée
- Filtrable par type d'opération

**Effort estimé :** 5 points

#### US-013 : Undo/Redo
**En tant qu'** utilisateur
**Je veux** annuler mes dernières opérations
**Afin de** corriger une erreur

**Critères d'acceptation :**
- `POST /stacks/{name}/undo` annule la dernière opération
- `POST /stacks/{name}/redo` refait une opération annulée
- Historique limité à 20 undo
- État de la pile restauré correctement
- Tests complets

**Effort estimé :** 8 points

---

### Sprint 6 : Opérations avancées

#### US-014 : Opérations mathématiques avancées
**En tant qu'** utilisateur
**Je veux** des opérations mathématiques avancées
**Afin de** faire des calculs plus complexes

**Critères d'acceptation :**
- `POST /op/pow` : puissance (a ^ b)
- `POST /op/sqrt` : racine carrée
- `POST /op/mod` : modulo
- `POST /op/abs` : valeur absolue
- Documentation Swagger mise à jour

**Effort estimé :** 5 points

#### US-015 : Fonctions trigonométriques
**En tant qu'** utilisateur
**Je veux** des fonctions trigonométriques
**Afin de** faire des calculs scientifiques

**Critères d'acceptation :**
- `POST /op/sin`, `/op/cos`, `/op/tan`
- Mode degrés/radians configurable
- Gestion des valeurs infinies (tan(π/2))
- Tests mathématiques précis

**Effort estimé :** 5 points

---

### Sprint 7 : Import/Export & Macros

#### US-016 : Export de pile
**En tant qu'** utilisateur
**Je veux** exporter ma pile
**Afin de** la partager ou la sauvegarder

**Critères d'acceptation :**
- `GET /stacks/{name}/export?format=json`
- Support formats : JSON, CSV
- Export inclut : pile + historique + metadata
- Content-Disposition header correct

**Effort estimé :** 3 points

#### US-017 : Import de pile
**En tant qu'** utilisateur
**Je veux** importer une pile
**Afin de** restaurer un calcul sauvegardé

**Critères d'acceptation :**
- `POST /stacks/{name}/import` avec fichier
- Validation du format
- Merge ou remplacement au choix
- Gestion des erreurs de parsing

**Effort estimé :** 3 points

#### US-018 : Macros/Scripts
**En tant qu'** utilisateur avancé
**Je veux** définir des macros réutilisables
**Afin d'** automatiser des séquences d'opérations

**Critères d'acceptation :**
- `POST /macros` pour créer une macro
- DSL simple : `[5, 3, "add", 2, "mul"]`
- `POST /stacks/{name}/execute-macro/{macro_id}`
- Limite : 100 opérations par macro
- Tests de macros complexes

**Effort estimé :** 8 points

---

## Phase 4 : Interface utilisateur (3-4 semaines)

### Sprint 8 : Frontend web

#### US-019 : Interface web React
**En tant qu'** utilisateur
**Je veux** une interface web graphique
**Afin d'** utiliser la calculatrice sans API

**Critères d'acceptation :**
- SPA React avec TypeScript
- Design responsive (mobile/desktop)
- Affichage de la pile en temps réel
- Boutons pour toutes les opérations
- Gestion des erreurs visuelles

**Effort estimé :** 13 points

#### US-020 : WebSocket temps réel
**En tant qu'** utilisateur
**Je veux** des updates en temps réel
**Afin de** voir les changements instantanément

**Critères d'acceptation :**
- Endpoint WebSocket `/ws`
- Push des changements de pile
- Notifications sur erreurs
- Reconnexion automatique
- Tests WebSocket

**Effort estimé :** 8 points

---

## Phase 5 : Scalabilité & Performance (3 semaines)

### Sprint 9 : Optimisation

#### US-021 : Tests de charge
**En tant qu'** équipe
**Je veux** des benchmarks de performance
**Afin d'** identifier les bottlenecks

**Critères d'acceptation :**
- Tests avec Locust ou K6
- Scénarios : 100/500/1000 users concurrents
- Rapport de performance généré
- Latence p95 < 100ms sous charge normale
- Optimisations appliquées

**Effort estimé :** 5 points

#### US-022 : Cache distribué
**En tant que** système
**Je veux** un cache efficace
**Afin de** réduire la latence

**Critères d'acceptation :**
- Cache Redis pour piles fréquentes
- Invalidation automatique sur update
- Métriques de cache hit/miss
- Performance améliorée de 30%

**Effort estimé :** 5 points

#### US-023 : Support multi-workers
**En tant que** système
**Je veux** scaler horizontalement
**Afin de** supporter plus d'utilisateurs

**Critères d'acceptation :**
- Architecture stateless
- Session partagée via Redis
- Load balancer configuré
- Tests de failover
- Documentation de déploiement multi-instances

**Effort estimé :** 8 points

---

## Phase 6 : API publique & Écosystème (2 semaines)

### Sprint 10 : API versioning & SDK

#### US-024 : API versioning
**En tant que** développeur API
**Je veux** versionner l'API
**Afin de** maintenir la compatibilité

**Critères d'acceptation :**
- Préfixe `/v1/` pour tous les endpoints
- `/v2/` prêt pour évolutions futures
- Stratégie de deprecation documentée
- Header API-Version supporté

**Effort estimé :** 3 points

#### US-025 : SDK Python
**En tant que** développeur tiers
**Je veux** un SDK Python
**Afin d'** intégrer facilement l'API

**Critères d'acceptation :**
- Package PyPI `rpn-calculator-sdk`
- Méthodes typées pour tous les endpoints
- Gestion automatique de l'auth
- Documentation complète
- Exemples d'utilisation

**Effort estimé :** 8 points

#### US-026 : SDK JavaScript/TypeScript
**En tant que** développeur frontend
**Je veux** un SDK JS/TS
**Afin d'** intégrer dans mes apps web

**Critères d'acceptation :**
- Package npm `@rpn-calculator/client`
- Support TypeScript natif
- Compatible Node.js et browsers
- Documentation et exemples

**Effort estimé :** 8 points

---

##  Fonctionnalités bonus (backlog)

Ces fonctionnalités sont des "nice to have" pour un MVP+.

### Collaboration
- **US-027** : Partage de pile entre utilisateurs
- **US-028** : Calculs collaboratifs en temps réel

### Intelligence
- **US-029** : Suggestions d'opérations basées sur l'historique
- **US-030** : Détection d'anomalies (résultats improbables)

### Internationalisation
- **US-031** : Support multi-langues (FR, EN, ES, DE)
- **US-032** : Formats numériques localisés

### Mobile
- **US-033** : Application mobile React Native
- **US-034** : Mode offline avec sync

### Analytics
- **US-035** : Dashboard analytics pour les utilisateurs
- **US-036** : Statistiques d'utilisation (opérations favorites, etc.)

---

##  Estimation globale

| Phase | Sprints | User Stories | Story Points | Durée estimée |
|-------|---------|--------------|--------------|---------------|
| Phase 1 | 2 | 6 | 23 | 4 semaines |
| Phase 2 | 2 | 5 | 24 | 3 semaines |
| Phase 3 | 3 | 7 | 39 | 5 semaines |
| Phase 4 | 2 | 2 | 21 | 4 semaines |
| Phase 5 | 1 | 3 | 18 | 3 semaines |
| Phase 6 | 1 | 3 | 19 | 2 semaines |
| **Total** | **11** | **26** | **144** | **21 semaines** |

**Note** : Estimations basées sur une équipe de 2 développeurs full-stack.

---

##  Critères de succès

### KPIs techniques
-  Uptime > 99.9%
-  Latence p95 < 100ms
-  Couverture de tests > 90%
-  0 vulnérabilités critiques

### KPIs produit
-  1000+ utilisateurs actifs mensuels
-  10000+ opérations par jour
-  NPS > 40
-  Taux de conversion gratuit → payant > 5% (si freemium)

---

**Dernière mise à jour** : Version initiale du projet
**Prochaine revue** : Fin du Sprint 1
