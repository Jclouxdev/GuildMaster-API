# Manuel de Mise à Jour - GuildMaster API

## Table des matières
1. [Processus de mise à jour](#processus-de-mise-à-jour)
2. [Types de mises à jour](#types-de-mises-à-jour)
3. [Préparation à la mise à jour](#préparation-à-la-mise-à-jour)
4. [Mise à jour en environnement de développement](#mise-à-jour-en-environnement-de-développement)
5. [Mise à jour en production](#mise-à-jour-en-production)
6. [Mise à jour des dépendances](#mise-à-jour-des-dépendances)
7. [Gestion des migrations de base de données](#gestion-des-migrations-de-base-de-données)
8. [Rollback en cas de problème](#rollback-en-cas-de-problème)
9. [Tests après mise à jour](#tests-après-mise-à-jour)
10. [Surveillance post-déploiement](#surveillance-post-déploiement)

## Processus de mise à jour

### Vue d'ensemble
Les mises à jour de GuildMaster API suivent un processus standardisé pour garantir la stabilité et minimiser les temps d'arrêt.

### Workflow de mise à jour
```
Développement → Tests → Staging → Production
     ↓            ↓        ↓          ↓
   Feature    Unit Tests  E2E Tests  Monitoring
   Branch    Integration  User Tests Health Check
```

### Branches Git
- `main` : Production stable
- `develop` : Développement actif
- `feature/*` : Nouvelles fonctionnalités
- `hotfix/*` : Corrections urgentes

## Types de mises à jour

### 1. Mise à jour mineure (Patch - x.x.X)
- Corrections de bugs
- Améliorations de sécurité
- Optimisations de performance
- **Pas de breaking changes**

### 2. Mise à jour intermédiaire (Minor - x.X.x)
- Nouvelles fonctionnalités
- Améliorations d'API
- Nouvelles routes
- **Rétrocompatible**

### 3. Mise à jour majeure (Major - X.x.x)
- Changements d'architecture
- Breaking changes
- Nouvelles versions de dépendances majeures
- **Nécessite une migration**

### 4. Mise à jour de sécurité (Hotfix)
- Corrections critiques
- Patches de sécurité
- **Déploiement urgent**

## Préparation à la mise à jour

### 1. Vérification des prérequis
```bash
# Vérifier la version actuelle
git describe --tags
npm version

# Vérifier l'état du repository
git status
git fetch origin
```

### 2. Sauvegarde préventive
```bash
# Sauvegarde de la base de données
pg_dump -h localhost -U guildmaster_user -d guildmaster_db > backup_pre_update_$(date +%Y%m%d_%H%M%S).sql

# Sauvegarde des fichiers de configuration
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Sauvegarde avec Docker
docker-compose exec database pg_dump -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Vérification de l'environnement
```bash
# Vérifier l'espace disque
df -h

# Vérifier la mémoire disponible
free -h

# Vérifier les processus en cours
ps aux | grep node

# Vérifier les ports utilisés
netstat -tlnp | grep :3000
```

### 4. Documentation des changements
```bash
# Consulter le changelog
git log --oneline main..develop

# Vérifier les migrations en attente
npm run typeorm:show

# Lister les nouvelles dépendances
npm outdated
```

## Mise à jour en environnement de développement

### 1. Récupération du code
```bash
# Changement vers la branche de développement
git checkout develop
git pull origin develop

# Ou récupération d'une version spécifique
git checkout tags/v1.2.0
```

### 2. Mise à jour des dépendances
```bash
# Installation des nouvelles dépendances
npm ci

# Mise à jour forcée si nécessaire
rm -rf node_modules package-lock.json
npm install
```

### 3. Configuration de l'environnement
```bash
# Vérifier les nouvelles variables d'environnement
diff .env.example .env

# Ajouter les nouvelles variables si nécessaire
echo "NOUVELLE_VARIABLE=valeur" >> .env
```

### 4. Exécution des migrations
```bash
# Vérifier les migrations en attente
npm run typeorm:show

# Exécuter les migrations
npm run typeorm:run

# Vérifier l'état de la base
npm run typeorm:status
```

### 5. Tests en développement
```bash
# Construction de l'application
npm run build

# Tests unitaires
npm run test

# Tests d'intégration
npm run test:e2e

# Démarrage en mode développement
npm run start:dev
```

## Mise à jour en production

### Stratégie de déploiement recommandée : Blue-Green

### 1. Préparation de l'environnement Blue (nouveau)
```bash
# Clonage vers un nouveau répertoire
git clone https://github.com/Jclouxdev/GuildMaster-API.git guildmaster-api-v2
cd guildmaster-api-v2

# Checkout de la version cible
git checkout tags/v1.2.0

# Configuration de l'environnement
cp ../guildmaster-api/.env .env
```

### 2. Installation et construction
```bash
# Installation des dépendances
npm ci --only=production

# Construction de l'application
npm run build

# Vérification de l'intégrité
npm audit --audit-level moderate
```

### 3. Tests de validation
```bash
# Tests sur base de données de test
DATABASE_URL=postgresql://test_user:password@localhost:5432/test_db npm run test:e2e

# Test de démarrage
NODE_ENV=production npm run start:prod &
sleep 10
curl http://localhost:3001/health
kill %1
```

### 4. Basculement avec Docker

#### Mise à jour sans interruption
```bash
# Construction de la nouvelle image
docker build -t guildmaster-api:v1.2.0 .

# Test de la nouvelle image
docker run -d --name test-api -p 3001:3000 --env-file .env guildmaster-api:v1.2.0

# Vérification
curl http://localhost:3001/

# Arrêt du test
docker stop test-api && docker rm test-api

# Mise à jour du docker-compose.yml
sed -i 's/guildmaster-api:latest/guildmaster-api:v1.2.0/' docker-compose.yml

# Déploiement de la nouvelle version
docker-compose up -d --no-deps api

# Vérification du déploiement
docker-compose ps
docker-compose logs api
```

### 5. Mise à jour avec PM2 (déploiement manuel)
```bash
# Arrêt gracieux de l'ancienne version
pm2 stop guildmaster-api

# Basculement vers la nouvelle version
ln -sfn /path/to/guildmaster-api-v2 /path/to/guildmaster-api-current

# Démarrage de la nouvelle version
cd /path/to/guildmaster-api-current
pm2 start dist/main.js --name guildmaster-api

# Vérification
pm2 status
pm2 logs guildmaster-api
```

## Mise à jour des dépendances

### 1. Audit de sécurité
```bash
# Vérification des vulnérabilités
npm audit

# Correction automatique
npm audit fix

# Correction manuelle si nécessaire
npm audit fix --force
```

### 2. Mise à jour des dépendances
```bash
# Vérification des dépendances obsolètes
npm outdated

# Mise à jour des dépendances mineures
npm update

# Mise à jour d'une dépendance spécifique
npm install @nestjs/core@latest

# Utilisation de npm-check-updates pour les mises à jour majeures
npx npm-check-updates -u
npm install
```

### 3. Test après mise à jour des dépendances
```bash
# Tests complets
npm run test
npm run test:e2e
npm run lint

# Vérification de compatibilité
npm run build
npm run start:prod &
sleep 10
curl http://localhost:3000/
kill %1
```

## Gestion des migrations de base de données

### 1. Génération de nouvelles migrations
```bash
# Génération automatique basée sur les changements d'entités
npm run typeorm:generate src/migrations/UpdateUserTable

# Création d'une migration vide
npm run typeorm:create src/migrations/CustomMigration
```

### 2. Exécution des migrations en production
```bash
# Sauvegarde avant migration
pg_dump -h localhost -U guildmaster_user -d guildmaster_db > backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql

# Test de la migration sur une copie
createdb -h localhost -U guildmaster_user test_migration_db
psql -h localhost -U guildmaster_user -d test_migration_db < backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql

# Test de migration
DATABASE_URL=postgresql://guildmaster_user:password@localhost:5432/test_migration_db npm run typeorm:run

# Si le test réussit, application en production
npm run typeorm:run

# Vérification de l'état
npm run typeorm:status
```

### 3. Migrations de données
```sql
-- Exemple de migration de données personnalisée
-- Migration: 1629876543210-MigrateUserData.sql

-- Mise à jour des données existantes
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Ajout de données par défaut
INSERT INTO guilds (id, name, region, created_at) 
VALUES (uuid_generate_v4(), 'Guilde par défaut', 'EU_WEST', NOW())
ON CONFLICT DO NOTHING;

-- Nettoyage des données obsolètes
DELETE FROM guild_memberships WHERE created_at < NOW() - INTERVAL '1 year';
```

## Rollback en cas de problème

### 1. Rollback avec Docker
```bash
# Retour à la version précédente
docker-compose down
git checkout v1.1.0
docker-compose up -d

# Ou utilisation d'un tag spécifique
docker tag guildmaster-api:v1.1.0 guildmaster-api:latest
docker-compose up -d --no-deps api
```

### 2. Rollback avec PM2
```bash
# Arrêt de la version problématique
pm2 stop guildmaster-api

# Retour au lien symbolique précédent
ln -sfn /path/to/guildmaster-api-v1.1.0 /path/to/guildmaster-api-current

# Redémarrage
pm2 start guildmaster-api
```

### 3. Rollback de base de données
```bash
# Arrêt de l'application
pm2 stop guildmaster-api
# ou
docker-compose stop api

# Restauration de la sauvegarde
psql -h localhost -U guildmaster_user -d guildmaster_db < backup_pre_update_20240821_143000.sql

# Rollback des migrations (si nécessaire)
npm run typeorm:revert

# Redémarrage avec l'ancienne version
pm2 start guildmaster-api
```

### 4. Plan de rollback automatisé
```bash
#!/bin/bash
# rollback.sh - Script de rollback automatisé

set -e

BACKUP_FILE="$1"
OLD_VERSION="$2"

if [ -z "$BACKUP_FILE" ] || [ -z "$OLD_VERSION" ]; then
    echo "Usage: $0 <backup_file> <old_version>"
    exit 1
fi

echo "🔄 Début du rollback vers $OLD_VERSION..."

# Arrêt de l'application
echo "📱 Arrêt de l'application..."
pm2 stop guildmaster-api

# Restauration de la base de données
echo "🗃️  Restauration de la base de données..."
psql -h localhost -U guildmaster_user -d guildmaster_db < "$BACKUP_FILE"

# Basculement vers l'ancienne version
echo "🔀 Basculement vers l'ancienne version..."
git checkout "$OLD_VERSION"
npm ci --only=production
npm run build

# Redémarrage
echo "🚀 Redémarrage de l'application..."
pm2 start dist/main.js --name guildmaster-api

# Vérification
echo "✅ Vérification du rollback..."
sleep 10
curl -f http://localhost:3000/ || (echo "❌ Échec du rollback" && exit 1)

echo "✅ Rollback réussi vers $OLD_VERSION"
```

## Tests après mise à jour

### 1. Tests automatisés
```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:e2e

# Tests de couverture
npm run test:cov

# Analyse de code
npm run lint
```

### 2. Tests manuels

#### Tests d'API
```bash
# Test de santé
curl http://localhost:3000/

# Test d'authentification
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test de création de guilde
curl -X POST http://localhost:3000/guild \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Test Guild","description":"Test","region":"EU_WEST"}'
```

#### Tests de performance
```bash
# Test de charge simple
ab -n 1000 -c 10 http://localhost:3000/

# Test avec authentification
# (nécessite Apache Bench avec support des en-têtes)
```

### 3. Tests de régression
```bash
# Liste de contrôle des fonctionnalités
✅ Inscription utilisateur
✅ Connexion utilisateur
✅ Création de guilde
✅ Adhésion à une guilde
✅ Recherche de guildes
✅ Gestion des membres
✅ Suppression de guilde
```

## Surveillance post-déploiement

### 1. Monitoring immédiat (première heure)
```bash
# Surveillance des logs
tail -f /var/log/guildmaster/application.log
# ou
docker-compose logs -f api
# ou
pm2 logs guildmaster-api

# Surveillance du CPU et mémoire
top -p $(pgrep -f "node.*guildmaster")

# Surveillance des connexions
netstat -an | grep :3000
```

### 2. Métriques clés à surveiller
- **Temps de réponse API** : < 200ms pour 95% des requêtes
- **Taux d'erreur** : < 1%
- **Utilisation CPU** : < 70%
- **Utilisation mémoire** : < 80%
- **Connexions base de données** : monitoring des connexions actives

### 3. Alertes recommandées
```bash
# Script de vérification de santé
#!/bin/bash
# health_check.sh

ENDPOINT="http://localhost:3000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT")

if [ "$RESPONSE" != "200" ]; then
    echo "ALERTE: API non disponible (HTTP $RESPONSE)"
    # Envoi d'alerte (email, Slack, etc.)
    exit 1
fi

echo "API opérationnelle"
```

### 4. Dashboard de monitoring
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## Checklist de mise à jour

### Pré-mise à jour
- [ ] Sauvegarde de la base de données créée
- [ ] Sauvegarde des fichiers de configuration
- [ ] Tests validés en environnement de développement
- [ ] Documentation des changements lue
- [ ] Plan de rollback préparé
- [ ] Équipe informée du déploiement

### Pendant la mise à jour
- [ ] Code source mis à jour
- [ ] Dépendances installées
- [ ] Application construite sans erreur
- [ ] Migrations exécutées avec succès
- [ ] Configuration mise à jour
- [ ] Application redémarrée

### Post-mise à jour
- [ ] Tests automatisés exécutés
- [ ] Tests manuels réalisés
- [ ] Monitoring vérifié
- [ ] Performance validée
- [ ] Logs surveillés (1 heure minimum)
- [ ] Équipe informée du succès

### En cas de problème
- [ ] Problème identifié et documenté
- [ ] Décision de rollback prise si nécessaire
- [ ] Rollback exécuté selon le plan
- [ ] Post-mortem planifié
- [ ] Correctifs planifiés pour la prochaine version

## Outils utiles

### Scripts de maintenance
```bash
# cleanup.sh - Nettoyage des anciennes versions
#!/bin/bash
find /deployments -name "guildmaster-api-*" -mtime +30 -exec rm -rf {} \;
find /backups -name "backup_*.sql" -mtime +7 -exec rm {} \;

# update.sh - Script de mise à jour automatisé
#!/bin/bash
set -e

VERSION="$1"
if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

echo "Mise à jour vers la version $VERSION"
./backup.sh
git checkout "$VERSION"
npm ci --only=production
npm run build
npm run typeorm:run
pm2 restart guildmaster-api
./health_check.sh
```

### Commandes utiles
```bash
# Vérification de l'état des services
systemctl status postgresql
systemctl status nginx
docker-compose ps

# Surveillance en temps réel
watch -n 1 'curl -s http://localhost:3000/health'
watch -n 1 'pm2 status'

# Analyse des logs
grep -i error /var/log/guildmaster/application.log | tail -20
journalctl -u guildmaster-api -f
```

## Documentation des versions

### Format du changelog
```markdown
## [1.2.0] - 2024-08-21

### Ajouté
- Nouvelle API de recherche de guildes
- Support des rôles d'officiers
- Validation améliorée des entrées

### Modifié
- Performance des requêtes de base de données améliorée
- Messages d'erreur plus explicites

### Corrigé
- Bug de duplication de membres
- Problème de validation d'email

### Sécurité
- Mise à jour des dépendances avec vulnérabilités
- Validation renforcée des tokens JWT

### Migration
- Nouvelle colonne `role` dans la table `guild_memberships`
- Index ajouté sur `guilds.region`
```

## Support et escalade

### Niveaux de support
1. **Support technique** : Problèmes de déploiement et configuration
2. **Support développement** : Bugs et problèmes de code
3. **Support critique** : Incidents de production

### Procédure d'escalade
1. Tentative de résolution avec la documentation
2. Vérification des logs et métriques
3. Consultation de l'équipe technique
4. Escalade vers l'équipe de développement si nécessaire

### Contacts d'urgence
- **Équipe technique** : technique@guildmaster.com
- **Équipe de développement** : dev@guildmaster.com
- **Astreinte** : +33 X XX XX XX XX (urgences uniquement)
