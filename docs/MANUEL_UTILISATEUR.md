# Manuel Utilisateur - GuildMaster API

## Table des matières
1. [Introduction](#introduction)
2. [Authentification](#authentification)
3. [Gestion des utilisateurs](#gestion-des-utilisateurs)
4. [Gestion des guildes](#gestion-des-guildes)
5. [Gestion des membres de guilde](#gestion-des-membres-de-guilde)
6. [Codes de réponse HTTP](#codes-de-réponse-http)
7. [Exemples d'utilisation](#exemples-dutilisation)
8. [Gestion des erreurs](#gestion-des-erreurs)

## Introduction

GuildMaster API est une API RESTful développée avec NestJS pour la gestion de guildes et de leurs membres. Elle fournit des endpoints pour l'authentification, la gestion des utilisateurs, des guildes et des adhésions.

### URL de base
- **Développement** : `http://localhost:3000`
- **Production** : `https://votre-domaine.com`

### Format des réponses
Toutes les réponses sont au format JSON. Les dates sont au format ISO 8601.

## Authentification

L'API utilise l'authentification JWT (JSON Web Token). Après connexion, vous recevrez un token d'accès à inclure dans l'en-tête `Authorization` de vos requêtes.

### Inscription

**Endpoint** : `POST /auth/register`

**Description** : Créer un nouveau compte utilisateur.

**Corps de la requête** :
```json
{
  "email": "utilisateur@example.com",
  "password": "motDePasse123",
  "username": "MonNomUtilisateur"
}
```

**Réponse de succès (201)** :
```json
{
  "user": {
    "id": "uuid-de-l-utilisateur",
    "email": "utilisateur@example.com",
    "username": "MonNomUtilisateur",
    "createdAt": "2024-08-21T14:30:00.000Z",
    "updatedAt": "2024-08-21T14:30:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Contraintes** :
- Email : format valide et unique
- Mot de passe : minimum 8 caractères
- Nom d'utilisateur : 3-20 caractères, unique

### Connexion

**Endpoint** : `POST /auth/login`

**Description** : Se connecter avec un compte existant.

**Corps de la requête** :
```json
{
  "email": "utilisateur@example.com",
  "password": "motDePasse123"
}
```

**Réponse de succès (200)** :
```json
{
  "user": {
    "id": "uuid-de-l-utilisateur",
    "email": "utilisateur@example.com",
    "username": "MonNomUtilisateur"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Profil utilisateur

**Endpoint** : `GET /auth/profile`

**Description** : Récupérer les informations du profil de l'utilisateur connecté.

**En-têtes requis** :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse de succès (200)** :
```json
{
  "id": "uuid-de-l-utilisateur",
  "email": "utilisateur@example.com",
  "username": "MonNomUtilisateur",
  "createdAt": "2024-08-21T14:30:00.000Z",
  "updatedAt": "2024-08-21T14:30:00.000Z"
}
```

## Gestion des utilisateurs

### Récupérer tous les utilisateurs

**Endpoint** : `GET /user`

**Description** : Récupérer la liste de tous les utilisateurs.

**En-têtes requis** :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse de succès (200)** :
```json
[
  {
    "id": "uuid-utilisateur-1",
    "email": "user1@example.com",
    "username": "Utilisateur1",
    "createdAt": "2024-08-21T14:30:00.000Z",
    "updatedAt": "2024-08-21T14:30:00.000Z"
  },
  {
    "id": "uuid-utilisateur-2",
    "email": "user2@example.com",
    "username": "Utilisateur2",
    "createdAt": "2024-08-21T14:30:00.000Z",
    "updatedAt": "2024-08-21T14:30:00.000Z"
  }
]
```

### Récupérer un utilisateur par ID

**Endpoint** : `GET /user/:id`

**Description** : Récupérer les informations d'un utilisateur spécifique.

**Paramètres** :
- `id` : UUID de l'utilisateur

**En-têtes requis** :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse de succès (200)** :
```json
{
  "id": "uuid-de-l-utilisateur",
  "email": "utilisateur@example.com",
  "username": "MonNomUtilisateur",
  "createdAt": "2024-08-21T14:30:00.000Z",
  "updatedAt": "2024-08-21T14:30:00.000Z"
}
```

## Gestion des guildes

### Créer une guilde

**Endpoint** : `POST /guild`

**Description** : Créer une nouvelle guilde.

**En-têtes requis** :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Corps de la requête** :
```json
{
  "name": "Ma Guilde Épique",
  "description": "Une guilde pour les aventuriers courageux",
  "region": "EU_WEST",
  "maxMembers": 50
}
```

**Réponse de succès (201)** :
```json
{
  "id": "uuid-de-la-guilde",
  "name": "Ma Guilde Épique",
  "description": "Une guilde pour les aventuriers courageux",
  "region": "EU_WEST",
  "maxMembers": 50,
  "memberCount": 1,
  "createdAt": "2024-08-21T14:30:00.000Z",
  "updatedAt": "2024-08-21T14:30:00.000Z"
}
```

**Régions disponibles** :
- `EU_WEST` : Europe de l'Ouest
- `EU_EAST` : Europe de l'Est
- `NA_WEST` : Amérique du Nord Ouest
- `NA_EAST` : Amérique du Nord Est
- `ASIA` : Asie
- `OCEANIA` : Océanie

### Récupérer toutes les guildes

**Endpoint** : `GET /guild`

**Description** : Récupérer la liste de toutes les guildes.

**En-têtes requis** :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse de succès (200)** :
```json
[
  {
    "id": "uuid-guilde-1",
    "name": "Guilde des Dragons",
    "description": "La guilde la plus puissante",
    "region": "EU_WEST",
    "maxMembers": 100,
    "memberCount": 45,
    "createdAt": "2024-08-21T14:30:00.000Z",
    "updatedAt": "2024-08-21T14:30:00.000Z"
  }
]
```

### Récupérer une guilde par ID

**Endpoint** : `GET /guild/:id`

**Description** : Récupérer les informations d'une guilde spécifique.

**Paramètres** :
- `id` : UUID de la guilde

### Récupérer une guilde par nom

**Endpoint** : `GET /guild/name/:name`

**Description** : Rechercher une guilde par son nom.

**Paramètres** :
- `name` : Nom de la guilde

### Récupérer les guildes par région

**Endpoint** : `GET /guild/region/:region`

**Description** : Récupérer toutes les guildes d'une région spécifique.

**Paramètres** :
- `region` : Code de la région (ex: EU_WEST)

### Supprimer une guilde

**Endpoint** : `DELETE /guild/:id`

**Description** : Supprimer une guilde (seul le créateur peut supprimer).

**Paramètres** :
- `id` : UUID de la guilde

**En-têtes requis** :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse de succès (200)** :
```json
{
  "message": "Guilde supprimée avec succès"
}
```

## Gestion des membres de guilde

### Rejoindre une guilde

**Endpoint** : `POST /guild-membership`

**Description** : Rejoindre une guilde existante.

**En-têtes requis** :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Corps de la requête** :
```json
{
  "guildId": "uuid-de-la-guilde",
  "role": "MEMBER"
}
```

**Rôles disponibles** :
- `LEADER` : Chef de guilde (créateur)
- `OFFICER` : Officier
- `MEMBER` : Membre simple

### Récupérer les membres d'une guilde

**Endpoint** : `GET /guild-membership/guild/:guildId`

**Description** : Récupérer tous les membres d'une guilde.

**Paramètres** :
- `guildId` : UUID de la guilde

### Quitter une guilde

**Endpoint** : `DELETE /guild-membership/:id`

**Description** : Quitter une guilde ou expulser un membre.

**Paramètres** :
- `id` : UUID de l'adhésion

## Codes de réponse HTTP

### Succès
- **200 OK** : Requête réussie
- **201 Created** : Ressource créée avec succès
- **204 No Content** : Suppression réussie

### Erreurs client
- **400 Bad Request** : Données de requête invalides
- **401 Unauthorized** : Authentification requise
- **403 Forbidden** : Accès refusé
- **404 Not Found** : Ressource non trouvée
- **409 Conflict** : Conflit (email/nom déjà utilisé)

### Erreurs serveur
- **500 Internal Server Error** : Erreur interne du serveur

## Exemples d'utilisation

### Exemple complet avec cURL

#### 1. Inscription
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "motDePasse123",
    "username": "JohnDoe"
  }'
```

#### 2. Connexion
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "motDePasse123"
  }'
```

#### 3. Création d'une guilde (avec token)
```bash
curl -X POST http://localhost:3000/guild \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Les Gardiens",
    "description": "Une guilde de protecteurs",
    "region": "EU_WEST",
    "maxMembers": 50
  }'
```

### Exemple avec JavaScript/Fetch

```javascript
// Configuration de base
const API_BASE_URL = 'http://localhost:3000';
let authToken = null;

// Fonction d'authentification
async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    authToken = data.access_token;
    return data;
  } else {
    throw new Error('Échec de la connexion');
  }
}

// Fonction pour créer une guilde
async function createGuild(guildData) {
  const response = await fetch(`${API_BASE_URL}/guild`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(guildData),
  });

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Échec de la création de la guilde');
  }
}

// Utilisation
async function example() {
  try {
    // Connexion
    await login('john@example.com', 'motDePasse123');
    
    // Création d'une guilde
    const guild = await createGuild({
      name: 'Ma Nouvelle Guilde',
      description: 'Description de ma guilde',
      region: 'EU_WEST',
      maxMembers: 30
    });
    
    console.log('Guilde créée:', guild);
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}
```

### Exemple avec Python/Requests

```python
import requests
import json

# Configuration
API_BASE_URL = 'http://localhost:3000'
auth_token = None

def login(email, password):
    global auth_token
    
    response = requests.post(
        f'{API_BASE_URL}/auth/login',
        headers={'Content-Type': 'application/json'},
        json={'email': email, 'password': password}
    )
    
    if response.status_code == 200:
        data = response.json()
        auth_token = data['access_token']
        return data
    else:
        raise Exception('Échec de la connexion')

def get_guilds():
    response = requests.get(
        f'{API_BASE_URL}/guild',
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception('Échec de la récupération des guildes')

# Utilisation
try:
    # Connexion
    login('john@example.com', 'motDePasse123')
    
    # Récupération des guildes
    guilds = get_guilds()
    print('Guildes:', json.dumps(guilds, indent=2))
    
except Exception as e:
    print(f'Erreur: {e}')
```

## Gestion des erreurs

### Format des réponses d'erreur

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

### Erreurs communes

#### Erreur de validation (400)
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

#### Erreur d'authentification (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Ressource non trouvée (404)
```json
{
  "statusCode": 404,
  "message": "Guilde non trouvée",
  "error": "Not Found"
}
```

#### Conflit (409)
```json
{
  "statusCode": 409,
  "message": "Un utilisateur avec cet email existe déjà",
  "error": "Conflict"
}
```

## Bonnes pratiques

### Sécurité
1. **Toujours utiliser HTTPS en production**
2. **Garder le token JWT sécurisé** (ne pas l'exposer dans l'URL)
3. **Renouveler le token régulièrement**
4. **Valider toutes les entrées côté client**

### Performance
1. **Mettre en cache les réponses** quand c'est approprié
2. **Pagination** pour les listes importantes
3. **Compression** des requêtes/réponses

### Gestion des erreurs
1. **Toujours vérifier le code de statut HTTP**
2. **Implémenter une gestion d'erreur globale**
3. **Afficher des messages d'erreur utiles à l'utilisateur**

## Limites et quotas

- **Token JWT** : Expire après 24h par défaut
- **Taille maximale des requêtes** : 1MB
- **Longueur maximale du nom de guilde** : 100 caractères
- **Longueur maximale de la description** : 500 caractères
- **Nombre maximum de membres par guilde** : Configurable (défaut: 100)

## Support

Pour toute question ou problème :
1. Consultez cette documentation
2. Vérifiez les codes d'erreur HTTP
3. Contactez l'équipe de développement

## Changelog

### Version 0.0.1
- Authentification JWT
- Gestion des utilisateurs
- Gestion des guildes
- Gestion des membres de guilde
- Documentation API complète
