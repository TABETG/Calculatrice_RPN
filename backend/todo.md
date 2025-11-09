# TODO - Améliorations et limitations

Ce fichier liste les raccourcis pris, limitations actuelles, et améliorations techniques à envisager pour faire évoluer le projet vers un niveau production.

##  Status actuel des améliorations (Mise à jour récente)

###  Récemment implémenté

**Architecture & Code**
-  Module RPN pur (domain/rpn_calculator.py) avec type hints complets
-  StackService avec historique et support multi-session
-  Opérations avancées: sqrt, pow, swap, dup, drop, peek
-  Système d'historique pour undo (100 états max)
-  Tracking des opérations et métadonnées

**Fonctionnalités**
-  Support des opérations de base (+, -, *, /)
-  Opérations avancées (sqrt, pow, swap, dup, drop)
-  Fonction undo dans le service
-  Normalisation des réponses (stack, size, top, metadata)

###  Prochaines étapes prioritaires

1. **Ajouter les routes API manquantes** pour les nouvelles opérations
2. **Tests complets** pour atteindre 100% de couverture
3. **Tooling** : black, ruff, mypy configuration
4. **Logging structuré** pour observabilité
5. **OpenAPI documentation** enrichie

---

##  Limitations actuelles

### Stockage et persistance

-  **Pile en mémoire uniquement** : La pile est stockée dans un singleton Python. Elle est perdue au redémarrage du serveur.
-  **Pas de persistance** : Aucune base de données ou système de cache (Redis) n'est utilisé.
-  **Session unique** : Une seule pile partagée pour tous les utilisateurs (pas de multi-tenancy).

### Scalabilité

-  **Pas de load balancing** : L'architecture singleton ne supporte pas le scaling horizontal.
-  **Pas de queue/workers** : Toutes les opérations sont synchrones.
-  **Pas de rate limiting** : Aucune protection contre les abus.

### Sécurité

-  **Pas d'authentification** : Endpoints publics sans auth.
-  **Pas d'autorisation** : Pas de contrôle d'accès (RBAC).
-  **Pas de validation approfondie** : Limites sur la taille de la pile et valeurs numériques non imposées.
-  **CORS ouvert** : `allow_origins=["*"]` accepte toutes les origines (OK pour démo, KO pour prod).

### Observabilité

-  **Logging minimal** : Pas de logs structurés (JSON logs).
-  **Pas de métriques** : Aucune instrumentation (Prometheus, StatsD).
-  **Pas de tracing** : Pas de distributed tracing (OpenTelemetry, Jaeger).
-  **Pas d'alerting** : Aucun système d'alertes (PagerDuty, Sentry).

### Tests

-  Tests unitaires complets pour la logique métier
-  Tests d'intégration API
-  **Tests pour nouvelles fonctionnalités** : sqrt, pow, swap, dup, drop, undo à tester
-  **Pas de tests de charge** : Aucun benchmark de performance.
-  **Pas de tests E2E** : Pas de tests end-to-end automatisés.
-  **Pas de tests de sécurité** : Pas d'audit de vulnérabilités automatisé.

### CI/CD

-  **Pas de pipeline CI/CD** : Pas d'intégration continue configurée.
-  **Pas de Docker** : Pas de Dockerfile ni docker-compose.
-  **Pas de déploiement automatisé** : Déploiement manuel uniquement.

## 🔧 Améliorations techniques prioritaires

### Court terme (Sprint 1-2)

1. **Ajouter la persistance Redis**
   - Remplacer le singleton par un client Redis
   - Supporter plusieurs piles (par clé utilisateur)
   - TTL pour auto-nettoyage des piles inactives

2. **Dockerisation**
   - Créer un Dockerfile multi-stage optimisé
   - docker-compose pour dev (app + Redis)
   - Images légères basées sur Alpine

3. **CI/CD basique**
   - GitHub Actions ou GitLab CI
   - Lint (black, flake8, mypy) sur chaque PR
   - Tests automatiques sur chaque commit
   - Build et push Docker image

4. **Logging structuré**
   - Passer à structlog ou python-json-logger
   - Logs au format JSON pour parsing facile
   - Corrélation IDs pour tracer les requêtes

5. **Validation renforcée**
   - Limite max de taille de pile (ex: 1000 éléments)
   - Validation des valeurs numériques (min/max, NaN, Infinity)
   - Timeout sur les opérations

### Moyen terme (Sprint 3-5)

6. **Authentification/Autorisation**
   - Ajouter JWT authentication
   - Associer chaque pile à un utilisateur
   - Rate limiting par utilisateur (ex: 100 req/min)

7. **API versioning**
   - Préfixe `/v1/` pour tous les endpoints
   - Stratégie de deprecation claire

8. **Monitoring et métriques**
   - Intégrer Prometheus
   - Métriques : nb requêtes, latence, taux erreurs, taille pile
   - Dashboards Grafana

9. **Tests de performance**
   - Benchmark avec Locust ou K6
   - Identifier les bottlenecks
   - Optimiser les opérations critiques

10. **Documentation enrichie**
    - Ajouter des exemples Postman/Insomnia
    - Tutoriel vidéo d'utilisation
    - Architecture Decision Records (ADR)

## 🎯 Améliorations fonctionnelles

### Court terme

1. **Historique des opérations**  **IMPLÉMENTÉ**
   -  Stocker l'historique des N dernières opérations
   -  Historique intégré au StackService
   -  Endpoint `GET /history` à ajouter aux routes

2. **Undo/Redo**  **IMPLÉMENTÉ (partiellement)**
   -  Fonction "annuler" la dernière opération dans service
   -  `POST /undo` et `POST /redo` endpoints à ajouter

3. **Opérations avancées**  **IMPLÉMENTÉ**
   -  Puissance (`a ^ b`)
   -  Racine carrée
   -  swap, dup, drop, peek
   -  modulo, fonctions trigonométriques

4. **Nommage des piles**  **IMPLÉMENTÉ (architecture)**
   -  Support multi-session dans StackService
   -  `POST /stacks/{name}` endpoint à ajouter
   -  `GET /stacks` pour lister toutes les piles

### Moyen terme

5. **Import/Export**
   - Exporter la pile en JSON/CSV
   - Importer une pile depuis un fichier

6. **Macros/Scripts**
   - Définir des séquences d'opérations réutilisables
   - `POST /macros` avec un DSL simple

7. **Notifications**
   - WebSocket pour updates en temps réel
   - Push notifications sur erreurs

8. **Interface web**
   - Frontend React/Vue minimal
   - Remplacer Swagger comme frontend principal

##  Refactoring et dette technique

1. **Type checking strict**
   - Ajouter mypy en mode strict
   - Éliminer tous les `type: ignore`

2. **Error handling unifié**
   - Middleware global pour gérer les exceptions
   - Format d'erreur standardisé (RFC 7807)

3. **Configuration externalisée**
   - Variables d'environnement via `.env`
   - Validation de config avec Pydantic Settings

4. **Dependency injection avancée**
   - Remplacer le singleton par FastAPI Depends
   - Faciliter le mocking dans les tests

5. **Documentation du code**
   - Augmenter les docstrings
   - Générer la doc API avec Sphinx

6. **Compatibilité Python**
   - Tester sur Python 3.9, 3.10, 3.11, 3.12
   - Matrix CI pour plusieurs versions

##  Sécurité

1. **Audit de dépendances**
   - Intégrer Snyk ou Dependabot
   - Scans réguliers des vulnérabilités

2. **Input sanitization**
   - Validation stricte de tous les inputs
   - Protection contre injection

3. **HTTPS obligatoire**
   - Forcer HTTPS en production
   - HSTS headers

4. **Secrets management**
   - Utiliser Vault ou AWS Secrets Manager
   - Rotation automatique des secrets

##  Internationalisation

1. **i18n des messages d'erreur**
   - Support multi-langues (FR, EN)
   - Header Accept-Language

2. **Formats numériques localisés**
   - Support des formats décimaux régionaux

##  Priorités recommandées

### P0 (Critique pour production)
- Persistance Redis
- Authentification JWT
- Logging structuré
- CI/CD basique
- Dockerisation

### P1 (Haute priorité)
- Rate limiting
- Monitoring/Métriques
- Tests de charge
- HTTPS/Sécurité

### P2 (Moyenne priorité)
- Undo/Redo
- Historique
- API versioning
- Frontend web

### P3 (Nice to have)
- Opérations avancées
- Macros/Scripts
- i18n

---

**Note** : Ces améliorations sont listées pour montrer la vision d'évolution du projet. Elles ne sont pas bloquantes pour la démo technique actuelle, mais seraient nécessaires pour un environnement de production réel.
