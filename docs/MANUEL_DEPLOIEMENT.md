# Manuel de Déploiement - GuildMaster API

## Table des matières
1. [Prérequis](#prérequis)
2. [Configuration de l'environnement](#configuration-de-lenvironnement)
3. [Déploiement avec Docker](#déploiement-avec-docker)
4. [Déploiement manuel](#déploiement-manuel)
5. [Déploiement sur Railway](#déploiement-sur-railway)
6. [Configuration de la base de données](#configuration-de-la-base-de-données)
7. [Vérification du déploiement](#vérification-du-déploiement)
8. [Troubleshooting](#troubleshooting)

## Prérequis

### Système requis
- **Node.js** : Version 18 ou supérieure
- **npm** : Version 8 ou supérieure
- **PostgreSQL** : Version 12 ou supérieure
- **Docker** (optionnel) : Version 20 ou supérieure
- **Docker Compose** (optionnel) : Version 2 ou supérieure

### Vérification des prérequis
```bash
node --version
npm --version
docker --version
docker-compose --version
```

## Configuration de l'environnement

### 1. Clonage du repository
```bash
git clone https://github.com/Jclouxdev/GuildMaster-API.git
cd GuildMaster-API
```

### 2. Configuration des variables d'environnement
Créez un fichier `.env` à la racine du projet en copiant le fichier exemple :

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos valeurs :

```bash
# Base de données
DB_ROOT_PASSWORD=votre_mot_de_passe_root
DATABASE_URL=postgresql://username:password@localhost:5432/guildmaster
DB_USER=guildmaster_user
DB_PASSWORD=votre_mot_de_passe_secure
DB_NAME=guildmaster_db

# Authentification JWT
JWT_SECRET=votre_jwt_secret_tres_secure_256_bits_minimum
JWT_EXPIRES_IN=24h

# Sécurité
BCRYPT_SALT_ROUNDS=12
```

⚠️ **Important** : Utilisez des valeurs sécurisées pour la production :
- JWT_SECRET : minimum 256 bits, généré aléatoirement
- Mots de passe : complexes et uniques

### 3. Génération des secrets sécurisés
```bash
# Génération d'un JWT secret sécurisé
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Génération d'un mot de passe sécurisé
openssl rand -base64 32
```

## Déploiement avec Docker

### Option recommandée pour la production

### 1. Déploiement complet avec Docker Compose
```bash
# Construction et lancement de tous les services
docker-compose up -d

# Vérification du statut
docker-compose ps

# Suivi des logs
docker-compose logs -f api
```

### 2. Déploiement avec Docker uniquement (base de données externe)
```bash
# Construction de l'image
docker build -t guildmaster-api .

# Lancement du conteneur
docker run -d \
  --name guildmaster-api \
  -p 3000:3000 \
  --env-file .env \
  guildmaster-api
```

### 3. Commandes Docker utiles
```bash
# Arrêt des services
docker-compose down

# Reconstruction des images
docker-compose build --no-cache

# Nettoyage des volumes (⚠️ SUPPRIME LES DONNÉES)
docker-compose down -v

# Redémarrage des services
docker-compose restart

# Accès au conteneur de l'API
docker-compose exec api sh

# Accès à la base de données
docker-compose exec database psql -U $DB_USER -d $DB_NAME
```

## Déploiement manuel

### 1. Installation des dépendances
```bash
npm ci --only=production
```

### 2. Construction de l'application
```bash
npm run build
```

### 3. Exécution des migrations
```bash
npm run typeorm:run
```

### 4. Démarrage de l'application
```bash
# Mode production
npm run start:prod

# Ou avec PM2 pour la gestion des processus
npm install -g pm2
pm2 start dist/main.js --name "guildmaster-api"
pm2 save
pm2 startup
```

## Déploiement sur Railway

### 1. Préparation du projet
Assurez-vous que les fichiers `railway.json` et `railway.toml` sont présents.

### 2. Configuration Railway
```bash
# Installation du CLI Railway
npm install -g @railway/cli

# Connexion à Railway
railway login

# Déploiement
railway up
```

### 3. Configuration des variables d'environnement sur Railway
Dans le dashboard Railway, ajoutez les variables d'environnement :
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`

## Configuration de la base de données

### 1. Configuration PostgreSQL locale
```bash
# Installation PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Création de l'utilisateur et de la base
sudo -u postgres psql
CREATE USER guildmaster_user WITH PASSWORD 'votre_mot_de_passe';
CREATE DATABASE guildmaster_db OWNER guildmaster_user;
GRANT ALL PRIVILEGES ON DATABASE guildmaster_db TO guildmaster_user;
\q
```

### 2. Configuration PostgreSQL avec Docker
```bash
# Lancement d'un conteneur PostgreSQL
docker run -d \
  --name guildmaster-postgres \
  -e POSTGRES_USER=guildmaster_user \
  -e POSTGRES_PASSWORD=votre_mot_de_passe \
  -e POSTGRES_DB=guildmaster_db \
  -p 5432:5432 \
  -v guildmaster_data:/var/lib/postgresql/data \
  postgres:14
```

### 3. Exécution des migrations
```bash
# Génération d'une nouvelle migration (si nécessaire)
npm run typeorm:generate src/migrations/InitialMigration

# Exécution des migrations
npm run typeorm:run

# Rollback d'une migration (si nécessaire)
npm run typeorm:revert
```

## Vérification du déploiement

### 1. Tests de santé de l'API
```bash
# Test de base
curl http://localhost:3000/

# Test avec authentification (après création d'un utilisateur)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Vérification de la base de données
```bash
# Connexion à la base
psql postgresql://guildmaster_user:password@localhost:5432/guildmaster_db

# Vérification des tables
\dt

# Vérification des migrations
SELECT * FROM migrations;
```

### 3. Tests automatisés
```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:e2e

# Tests avec couverture
npm run test:cov
```

## Configuration de reverse proxy (Nginx)

### Configuration Nginx pour la production
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL/TLS avec Let's Encrypt

```bash
# Installation de Certbot
sudo apt install certbot python3-certbot-nginx

# Obtention du certificat SSL
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring et logs

### 1. Configuration des logs
```bash
# Avec PM2
pm2 logs guildmaster-api

# Avec Docker
docker-compose logs -f api

# Fichiers de logs personnalisés
mkdir -p /var/log/guildmaster
```

### 2. Monitoring avec PM2
```bash
# Installation de PM2
npm install -g pm2

# Monitoring
pm2 monit

# Configuration du monitoring
pm2 install pm2-logrotate
```

## Troubleshooting

### Problèmes courants

#### 1. Erreur de connexion à la base de données
```bash
# Vérification de la connectivité
pg_isready -h localhost -p 5432

# Vérification des permissions
sudo -u postgres psql -c "SELECT version();"
```

#### 2. Erreur de port déjà utilisé
```bash
# Vérification des processus utilisant le port 3000
lsof -i :3000

# Arrêt du processus
kill -9 PID
```

#### 3. Problèmes de permissions Docker
```bash
# Ajout de l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Redémarrage de la session
logout # puis reconnexion
```

#### 4. Erreurs de migration
```bash
# Réinitialisation des migrations (⚠️ PERTE DE DONNÉES)
npm run typeorm:drop
npm run typeorm:run

# Vérification du schéma
npm run typeorm:schema:log
```

### Logs de débogage
```bash
# Mode debug pour l'application
NODE_ENV=development npm run start:debug

# Logs détaillés avec Docker
docker-compose up --no-daemon

# Accès aux logs spécifiques
docker-compose logs database
```

## Sauvegarde et restauration

### 1. Sauvegarde de la base de données
```bash
# Sauvegarde complète
pg_dump -h localhost -U guildmaster_user -d guildmaster_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Sauvegarde avec compression
pg_dump -h localhost -U guildmaster_user -d guildmaster_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 2. Restauration
```bash
# Restauration depuis un fichier SQL
psql -h localhost -U guildmaster_user -d guildmaster_db < backup_20240821_143000.sql

# Restauration depuis un fichier compressé
gunzip -c backup_20240821_143000.sql.gz | psql -h localhost -U guildmaster_user -d guildmaster_db
```

## Checklist de déploiement

- [ ] Prérequis installés et vérifiés
- [ ] Variables d'environnement configurées
- [ ] Secrets générés de manière sécurisée
- [ ] Base de données créée et accessible
- [ ] Migrations exécutées avec succès
- [ ] Application construite sans erreur
- [ ] Tests passés avec succès
- [ ] Service démarré et accessible
- [ ] Reverse proxy configuré (si applicable)
- [ ] SSL/TLS configuré (si applicable)
- [ ] Monitoring configuré
- [ ] Sauvegarde automatique configurée
- [ ] Documentation mise à jour

## Support

En cas de problème lors du déploiement :
1. Consultez la section [Troubleshooting](#troubleshooting)
2. Vérifiez les logs de l'application et de la base de données
3. Consultez la documentation NestJS : https://docs.nestjs.com
4. Contactez l'équipe de développement
