# API Schema pour GuildMaster - Planning et Raids MVP

## Informations générales

### Base URL
```
https://api.guildmaster.com/v1
```

### Stack technique recommandée
- **Backend**: Node.js avec Express/Fastify ou NestJS
- **Base de données**: PostgreSQL avec Prisma ORM (recommandé) ou MongoDB
- **Authentication**: JWT avec refresh tokens
- **Validation**: Zod ou Joi pour validation des schémas
- **Cache**: Redis pour les sessions et données fréquentes

### Architecture
- **Pattern**: RESTful API avec structure modulaire
- **Middleware**: Auth, validation, error handling, logging
- **Structure recommandée**: Controllers → Services → Repositories
- **Tests**: Unit tests avec Jest, integration tests pour endpoints critiques

## Authentication
Toutes les routes nécessitent un token JWT dans le header (sauf auth/login et auth/register):
```
Authorization: Bearer <token>
```

### JWT Structure
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  guildRole: 'Guild Master' | 'Officer' | 'Member';
  iat: number;
  exp: number;
}
```

### Permissions
- **Guild Master**: Accès total (CRUD sur tous les raids, users, personnages)
- **Officer**: Peut créer/modifier/supprimer raids, voir tous les personnages
- **Member**: Peut créer ses personnages, s'inscrire aux raids, voir raids publics

### Rate Limiting
- **Auth endpoints**: 5 requêtes/minute par IP
- **Standard endpoints**: 100 requêtes/minute par utilisateur
- **Heavy endpoints** (guild stats, roster): 10 requêtes/minute par utilisateur

## Models

### Database Relations
```
User 1:N Character
User 1:N RaidRegistration
User 1:N Raid (createdBy)
Raid 1:N RaidRegistration
Character N:M RaidRegistration (through characterIds array)
```

### Indexes recommandés
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_guild_role ON users(guild_role);

-- Characters
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_class ON characters(class);
CREATE INDEX idx_characters_is_main ON characters(is_main);
CREATE INDEX idx_characters_level_ilvl ON characters(level, item_level);

-- Raids
CREATE INDEX idx_raids_date ON raids(date);
CREATE INDEX idx_raids_status ON raids(status);
CREATE INDEX idx_raids_created_by ON raids(created_by);
CREATE INDEX idx_raids_difficulty ON raids(difficulty);

-- Raid Registrations
CREATE INDEX idx_raid_registrations_raid_id ON raid_registrations(raid_id);
CREATE INDEX idx_raid_registrations_user_id ON raid_registrations(user_id);
CREATE INDEX idx_raid_registrations_status ON raid_registrations(status);
```

### User
```typescript
interface User {
  id: string; // UUID v4
  email: string; // Unique, format email valide
  firstName: string; // 2-50 caractères, alphanumériques + espaces/tirets
  lastName: string; // 2-50 caractères, alphanumériques + espaces/tirets
  guildRole: 'Guild Master' | 'Officer' | 'Member'; // Default: 'Member'
  passwordHash: string; // Stocké avec bcrypt/argon2, min 8 caractères
  emailVerified: boolean; // Default: false
  createdAt: Date;
  updatedAt: Date;
}

// Contraintes DB
// - email: UNIQUE, NOT NULL
// - Un seul Guild Master par guilde (contrainte métier)
// - firstName + lastName: NOT NULL, length > 0
```

### Character
```typescript
// Types pour les spécialisations
type WowClass = 'Warrior' | 'Paladin' | 'Hunter' | 'Rogue' | 'Priest' | 'Shaman' | 'Mage' | 'Warlock' | 'Monk' | 'Druid' | 'Demon Hunter' | 'Death Knight' | 'Evoker';

type WowSpec = 
  // Warrior
  'Arms' | 'Fury' | 'Protection (Warrior)' |
  // Paladin
  'Holy' | 'Protection (Paladin)' | 'Retribution' |
  // Hunter
  'Beast Mastery' | 'Marksmanship' | 'Survival' |
  // Rogue
  'Assassination' | 'Outlaw' | 'Subtlety' |
  // Priest
  'Discipline' | 'Holy (Priest)' | 'Shadow' |
  // Shaman
  'Elemental' | 'Enhancement' | 'Restoration (Shaman)' |
  // Mage
  'Arcane' | 'Fire' | 'Frost (Mage)' |
  // Warlock
  'Affliction' | 'Demonology' | 'Destruction' |
  // Monk
  'Brewmaster' | 'Mistweaver' | 'Windwalker' |
  // Druid
  'Balance' | 'Feral' | 'Guardian' | 'Restoration (Druid)' |
  // Demon Hunter
  'Havoc' | 'Vengeance' |
  // Death Knight
  'Blood' | 'Frost (DK)' | 'Unholy' |
  // Evoker
  'Devastation' | 'Preservation' | 'Augmentation';

## Données de référence WoW (à stocker en base ou config)

### Classes et Spécialisations
```typescript
// Référentiel complet à implémenter
const WOW_CLASSES_REFERENCE = {
  'Warrior': {
    name: 'Guerrier',
    specs: [
      { name: 'Arms', role: 'DPS', frenchName: 'Armes' },
      { name: 'Fury', role: 'DPS', frenchName: 'Fureur' },
      { name: 'Protection (Warrior)', role: 'Tank', frenchName: 'Protection' }
    ]
  },
  // ... toutes les 13 classes avec leurs 40+ spécialisations
};

const INSTANCES_REFERENCE = [
  'Aberrus, the Shadowed Crucible',
  'Vault of the Incarnates',
  'Amirdrassil, the Dream\'s Hope',
  'Neltharus',
  'The Azure Vault',
  // ... toutes les instances actuelles
];

const MASTERY_LEVELS_REFERENCE = [
  { value: 'Débutant', weight: 1, description: 'Découverte de la spécialisation' },
  { value: 'Intermédiaire', weight: 2, description: 'Bases maîtrisées' },
  { value: 'Avancé', weight: 3, description: 'Bonne maîtrise' },
  { value: 'Expert', weight: 4, description: 'Maîtrise parfaite' }
];
```

### Logique métier importante

#### Calcul du rôle principal
```typescript
function calculatePrimaryRole(specializations: CharacterSpecialization[]): 'Tank' | 'Healer' | 'DPS' {
  // 1. Prendre la spécialisation préférée (isPreferred: true)
  // 2. Si aucune préférée, prendre celle avec le plus haut niveau de maîtrise
  // 3. Retourner le rôle de cette spécialisation
}
```

#### Validation des inscriptions
```typescript
function canRegisterToRaid(raid: Raid, user: User, characters: Character[]): boolean {
  // - Raid status doit être 'Open'
  // - User pas déjà inscrit
  // - Au moins 1 character éligible (niveau, ilvl si requis)
  // - Raid pas full
}
```

#### Suggestion de composition
```typescript
interface CompositionSuggestion {
  tanks: { min: number; max: number; };
  healers: { min: number; max: number; };
  dps: { min: number; max: number; };
}

// Règles par taille de raid
const COMPOSITION_RULES = {
  10: { tanks: {min: 1, max: 2}, healers: {min: 2, max: 3}, dps: {min: 5, max: 7} },
  15: { tanks: {min: 2, max: 2}, healers: {min: 3, max: 4}, dps: {min: 9, max: 10} },
  20: { tanks: {min: 2, max: 3}, healers: {min: 4, max: 5}, dps: {min: 12, max: 14} },
  25: { tanks: {min: 2, max: 3}, healers: {min: 5, max: 6}, dps: {min: 16, max: 18} }
};
```

interface CharacterSpecialization {
  spec: WowSpec;
  masteryLevel: MasteryLevel;
  isPreferred: boolean; // Si c'est une spé que le joueur préfère jouer
}

interface Character {
  id: string; // UUID v4
  userId: string; // Foreign key vers User.id
  name: string; // 2-12 caractères, alphanumériques (règles WoW)
  level: number; // 1-80, integer
  class: WowClass; // Enum strict, validation contre CLASSES_REFERENCE
  itemLevel?: number; // 1-600, integer, optionnel
  specializations: CharacterSpecialization[]; // Array, min 1 élément, max 4
  primaryRole: 'Tank' | 'Healer' | 'DPS'; // Calculé automatiquement depuis spec préférée
  isMain: boolean; // Default: false, contrainte: 1 seul main par user
  server?: string; // Optionnel, 2-50 caractères
  notes?: string; // Optionnel, max 500 caractères
  createdAt: Date;
  updatedAt: Date;
}

// Contraintes DB et métier
// - name + userId: UNIQUE (pas 2 persos même nom pour même user)
// - name: validation regex WoW: /^[A-Za-z]{2,12}$/
// - specializations: JSON field, validation côté app
// - isMain: constraint unique par userId
// - level: CHECK constraint (level >= 1 AND level <= 80)
// - itemLevel: CHECK constraint (item_level >= 1 AND item_level <= 600)
```

### Raid
```typescript
interface Raid {
  id: string; // UUID v4
  name: string; // 5-100 caractères, NOT NULL
  description?: string; // Max 1000 caractères
  objective?: string; // Max 500 caractères
  date: Date; // NOT NULL, doit être dans le futur pour création
  duration: number; // Minutes, 30-480 (8h max), default: 180
  maxPlayers: number; // 5-40, default: 20
  difficulty: 'Normal' | 'Heroic' | 'Mythic'; // Enum strict
  instance: string; // Référence vers INSTANCES_REFERENCE
  createdBy: string; // Foreign key vers User.id, NOT NULL
  createdAt: Date;
  updatedAt: Date;
  status: 'Draft' | 'Open' | 'Full' | 'InProgress' | 'Completed' | 'Cancelled';
}

// Contraintes DB et métier
// - date: CHECK constraint (date > NOW() pour nouveaux raids)
// - maxPlayers: CHECK (max_players >= 5 AND max_players <= 40)
// - duration: CHECK (duration >= 30 AND duration <= 480)
// - createdBy: doit avoir role 'Officer' ou 'Guild Master'
// - status transitions: Draft->Open->InProgress->Completed/Cancelled
// - instance: validation contre liste instances WoW autorisées
```

### RaidRegistration
```typescript
interface RaidRegistration {
  id: string; // UUID v4
  raidId: string; // Foreign key vers Raid.id, NOT NULL
  userId: string; // Foreign key vers User.id, NOT NULL
  characterIds: string[]; // Array UUIDs, min 1, max 3, validation existence
  selectedCharacterId?: string; // Doit être dans characterIds si présent
  preferredSpecs?: WowSpec[]; // Array optionnel, validation contre SPECS_REFERENCE
  availableRoles?: ('Tank' | 'Healer' | 'DPS')[]; // Array calculé depuis characters
  status: 'Pending' | 'Accepted' | 'Declined' | 'Standby'; // Default: 'Pending'
  notes?: string; // Max 300 caractères
  registeredAt: Date; // Default: NOW()
  updatedAt: Date;
}

// Contraintes DB et métier
// - raidId + userId: UNIQUE (pas double inscription)
// - characterIds: tous doivent appartenir à userId
// - selectedCharacterId: null par default, seuls raid leaders peuvent modifier
// - status transitions: Pending -> Accepted/Declined/Standby
// - availableRoles: calculé automatiquement depuis les specs des characters
// - validation: raid doit être en status 'Open' pour inscription
```

## Endpoints

### Auth & Users
```
POST   /auth/login              - Connexion
POST   /auth/register           - Inscription
GET    /auth/me                 - Profil utilisateur actuel
PUT    /auth/me                 - Mettre à jour profil
POST   /auth/logout             - Déconnexion (blacklist token)
POST   /auth/refresh            - Refresh token
POST   /auth/forgot-password    - Demande reset password
POST   /auth/reset-password     - Reset password avec token
```

#### Détails Auth
```typescript
// POST /auth/register
interface RegisterRequest {
  email: string; // Validation: format email + unique
  password: string; // Min 8 chars, 1 majuscule, 1 chiffre, 1 spécial
  firstName: string; // 2-50 chars, alphanumériques
  lastName: string; // 2-50 chars, alphanumériques
}

// POST /auth/login
interface LoginRequest {
  email: string;
  password: string;
}

// Response d'auth
interface AuthResponse {
  success: true;
  data: {
    user: User;
    accessToken: string; // JWT, expire 15min
    refreshToken: string; // Expire 7 jours
  };
}

// Middleware d'auth pour routes protégées
function requireAuth(req, res, next) {
  // 1. Vérifier présence token
  // 2. Vérifier validité JWT
  // 3. Vérifier token pas blacklisté
  // 4. Ajouter user à req.user
}

function requireRole(roles: string[]) {
  // Middleware pour vérifier rôle spécifique
  // Usage: requireRole(['Guild Master', 'Officer'])
}
```

### Characters
```
GET    /characters              - Liste des personnages de l'utilisateur
POST   /characters              - Créer un personnage
PUT    /characters/:id          - Mettre à jour un personnage
DELETE /characters/:id          - Supprimer un personnage
GET    /characters/guild        - Tous les personnages de la guilde (pour raid leaders)

# Nouveaux endpoints pour les spécialisations
PUT    /characters/:id/specializations - Mettre à jour les spécialisations d'un personnage
POST   /characters/:id/specializations - Ajouter une spécialisation
DELETE /characters/:id/specializations/:specId - Supprimer une spécialisation

# Référentiels WoW
GET    /reference/classes       - Liste des classes WoW avec leurs spécialisations
GET    /reference/specs         - Liste de toutes les spécialisations avec leurs rôles
GET    /reference/masteryLevels - Liste des niveaux de maîtrise disponibles
```

#### Logique métier Characters
```typescript
// Validation création personnage
function validateCharacter(data: Partial<Character>, userId: string) {
  // 1. Vérifier name unique pour cet user
  // 2. Vérifier regex nom WoW: /^[A-Za-z]{2,12}$/
  // 3. Vérifier classe valide dans CLASSES_REFERENCE
  // 4. Vérifier spécialisations valides pour cette classe
  // 5. Si isMain: true, vérifier pas déjà un main
  // 6. Valider niveau et itemLevel dans ranges
}

// Business rules importantes
const CHARACTER_RULES = {
  maxCharactersPerUser: 10,
  maxMainCharactersPerUser: 1,
  maxSpecializationsPerCharacter: 4,
  minLevel: 1,
  maxLevel: 80,
  minItemLevel: 1,
  maxItemLevel: 600
};

// Permissions
// GET /characters: utilisateur connecté voit ses propres characters
// GET /characters/guild: Officers+ voient tous les characters
// POST/PUT/DELETE: utilisateur peut modifier ses propres characters
// Guild Master peut modifier tous les characters
```

### Exemples de requêtes

#### Créer un personnage
```typescript
POST /characters
{
  "name": "Thorgar",
  "level": 80,
  "class": "Warrior",
  "itemLevel": 480,
  "server": "Hyjal",
  "isMain": true,
  "notes": "Disponible tous les soirs sauf mercredi",
  "specializations": [
    {
      "spec": "Protection (Warrior)",
      "masteryLevel": "Expert",
      "isPreferred": true
    },
    {
      "spec": "Arms",
      "masteryLevel": "Avancé",
      "isPreferred": false
    }
  ]
}
```

#### S'inscrire à un raid avec spécialisations
```typescript
POST /raids/:id/register
{
  "characterIds": ["char1", "char2"],
  "preferredSpecs": ["Protection (Warrior)", "Arms"],
  "availableRoles": ["Tank", "DPS"],
  "notes": "Préfère tank mais peut DPS si besoin"
}
```

#### Réponse composition de raid
```typescript
GET /raids/:id/composition
{
  "success": true,
  "data": {
    "tanks": [
      {
        "userId": "user1",
        "characterId": "char1",
        "characterName": "Thorgar",
        "class": "Warrior",
        "spec": "Protection (Warrior)",
        "masteryLevel": "Expert",
        "itemLevel": 480
      }
    ],
    "healers": [
      {
        "userId": "user2",
        "characterId": "char2",
        "characterName": "Healbot",
        "class": "Priest",
        "spec": "Holy (Priest)",
        "masteryLevel": "Avancé",
        "itemLevel": 470
      }
    ],
    "dps": [
      // ... autres DPS
    ],
    "summary": {
      "tanks": 2,
      "healers": 4,
      "dps": 14,
      "total": 20,
      "maxPlayers": 20
    }
  }
}
```

#### Statistiques de guilde
```typescript
GET /guild/stats
{
  "success": true,
  "data": {
    "totalMembers": 45,
    "totalCharacters": 78,
    "classDistribution": {
      "Warrior": 8,
      "Paladin": 6,
      "Hunter": 7,
      // ... autres classes
    },
    "roleDistribution": {
      "Tank": 12,
      "Healer": 18,
      "DPS": 48
    },
    "masteryDistribution": {
      "Expert": 23,
      "Avancé": 31,
      "Intermédiaire": 19,
      "Débutant": 5
    },
    "averageItemLevel": 475,
    "mainCharacters": 45
  }
}
```

### Raids
```
GET    /raids                   - Liste des raids (avec filtres)
  Query params: 
  - startDate?: string (ISO date)
  - endDate?: string (ISO date)
  - difficulty?: 'Normal'|'Heroic'|'Mythic'
  - status?: 'Draft'|'Open'|'Full'|'InProgress'|'Completed'|'Cancelled'
  - instance?: string
  - page?: number (default: 1)
  - limit?: number (default: 20, max: 100)

POST   /raids                   - Créer un raid (Guild Master/Officer seulement)
GET    /raids/:id               - Détails d'un raid
PUT    /raids/:id               - Modifier un raid (Creator/Guild Master/Officer seulement)
DELETE /raids/:id               - Supprimer un raid (Creator/Guild Master/Officer seulement)
```

#### Logique métier Raids
```typescript
// Validation création raid
function validateRaid(data: Partial<Raid>, user: User) {
  // 1. Vérifier permissions (Officer+)
  // 2. Vérifier date dans le futur
  // 3. Vérifier instance existe dans INSTANCES_REFERENCE
  // 4. Vérifier maxPlayers dans range valide
  // 5. Vérifier duration raisonnable
}

// State machine pour status
const RAID_STATUS_TRANSITIONS = {
  'Draft': ['Open', 'Cancelled'],
  'Open': ['Full', 'InProgress', 'Cancelled'],
  'Full': ['Open', 'InProgress', 'Cancelled'],
  'InProgress': ['Completed', 'Cancelled'],
  'Completed': [], // Final state
  'Cancelled': []  // Final state
};

// Auto-update status
function updateRaidStatus(raid: Raid, registrationsCount: number) {
  // Si Open et registrations >= maxPlayers: passer à Full
  // Si Full et registrations < maxPlayers: passer à Open
  // Si date passée et status Open/Full: passer à InProgress
}

// Permissions raids
const RAID_PERMISSIONS = {
  create: ['Guild Master', 'Officer'],
  read: ['Guild Master', 'Officer', 'Member'], // Tous peuvent voir
  update: ['Guild Master', 'Officer'], // + creator du raid
  delete: ['Guild Master'], // + creator du raid si Officer
  manage_registrations: ['Guild Master', 'Officer'] // + creator du raid
};
```

### Raid Registrations
```
GET    /raids/:id/registrations - Liste des inscriptions d'un raid
POST   /raids/:id/register      - S'inscrire à un raid
PUT    /raids/:id/registrations/:regId/select - Sélectionner un personnage (Raid leaders)
DELETE /raids/:id/unregister    - Se désinscrire d'un raid

# Nouveaux endpoints pour la composition
GET    /raids/:id/composition   - Composition actuelle du raid (avec rôles et spécialisations)
POST   /raids/:id/composition/suggest - Suggestions de composition optimale
GET    /raids/:id/roster-analysis - Analyse du roster disponible pour ce raid
```

#### Logique métier Registrations
```typescript
// Validation inscription
function validateRegistration(raidId: string, userId: string, data: RegisterRequest) {
  // 1. Vérifier raid exists et status = 'Open'
  // 2. Vérifier user pas déjà inscrit
  // 3. Vérifier raid pas full
  // 4. Vérifier characters appartiennent au user
  // 5. Vérifier au moins 1 character éligible (niveau/ilvl)
}

// Auto-calcul des rôles disponibles
function calculateAvailableRoles(characters: Character[]): string[] {
  // Parser toutes les spécialisations des characters
  // Retourner array unique des rôles possibles
}

// Algorithme de suggestion de composition
function suggestComposition(raid: Raid, registrations: RaidRegistration[]) {
  // 1. Récupérer règles composition pour maxPlayers
  // 2. Analyser inscriptions par rôle et niveau maîtrise
  // 3. Optimiser selon: level, itemLevel, masteryLevel, isPreferred
  // 4. Respecter contraintes min/max par rôle
  // 5. Prioriser mains et spécialisations préférées
}

// Business rules
const REGISTRATION_RULES = {
  maxCharactersPerRegistration: 3,
  minLevelForHeroic: 78,
  minLevelForMythic: 80,
  minItemLevelForHeroic: 460,
  minItemLevelForMythic: 480
};
```

## Performances & Optimisation

### Cache Strategy
```typescript
// Redis cache recommendations
const CACHE_KEYS = {
  userProfile: (userId: string) => `user:${userId}`,
  userCharacters: (userId: string) => `characters:${userId}`,
  raidDetails: (raidId: string) => `raid:${raidId}`,
  raidRegistrations: (raidId: string) => `registrations:${raidId}`,
  guildRoster: () => 'guild:roster',
  reference: (type: string) => `reference:${type}`
};

const CACHE_TTL = {
  userProfile: 300, // 5 minutes
  characters: 600, // 10 minutes
  raids: 180, // 3 minutes
  registrations: 60, // 1 minute
  guildStats: 1800, // 30 minutes
  reference: 86400 // 24 heures
};
```

### Database Optimisation
```sql
-- Requêtes complexes à optimiser

-- 1. Liste raids avec count inscriptions
SELECT r.*, COUNT(rr.id) as registrations_count 
FROM raids r 
LEFT JOIN raid_registrations rr ON r.id = rr.raid_id 
WHERE r.date >= NOW() AND r.status = 'Open'
GROUP BY r.id 
ORDER BY r.date;

-- 2. Composition raid avec détails characters
SELECT 
  rr.status,
  c.name, c.class, c.level, c.item_level, c.specializations,
  u.first_name, u.last_name
FROM raid_registrations rr
JOIN characters c ON c.id = rr.selected_character_id
JOIN users u ON u.id = rr.user_id
WHERE rr.raid_id = ? AND rr.status = 'Accepted';

-- 3. Stats guilde par classe/rôle
SELECT 
  c.class,
  COUNT(*) as count,
  AVG(c.level) as avg_level,
  AVG(c.item_level) as avg_ilvl
FROM characters c
JOIN users u ON u.id = c.user_id
GROUP BY c.class;
```

### Pagination & Filtres
```typescript
// Standard pagination response
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filtres avancés pour raids
interface RaidFilters {
  startDate?: string;
  endDate?: string;
  difficulty?: string[];
  status?: string[];
  instance?: string[];
  createdBy?: string;
  hasSpots?: boolean; // raids non complets
}
```

### Calendar
```
GET    /calendar/raids          - Raids pour une période donnée
  Query params:
  - startDate: string (required)
  - endDate: string (required)
  - view: 'week' | 'month' (default: week)
```

## Réponses API

### Success Response
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
```

### Error Response
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Codes d'erreur
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (pas les permissions)
- `404` - Not Found
- `409` - Conflict (ex: personnage déjà inscrit)
- `422` - Validation Error
- `500` - Internal Server Error

### Erreurs spécifiques aux personnages
- `CHAR_001` - Nom de personnage déjà utilisé par cet utilisateur
- `CHAR_002` - Classe WoW invalide
- `CHAR_003` - Spécialisation invalide pour cette classe
- `CHAR_004` - Niveau de maîtrise invalide
- `CHAR_005` - Un seul personnage principal autorisé par utilisateur
- `CHAR_006` - Au moins une spécialisation requise
- `CHAR_007` - Une seule spécialisation préférée autorisée

### Erreurs spécifiques aux raids
- `RAID_001` - Inscription déjà existante pour ce raid
- `RAID_002` - Raid complet
- `RAID_003` - Personnage non éligible (niveau, ilvl)
- `RAID_004` - Rôle déjà pourvu
- `RAID_005` - Spécialisation non adaptée à ce raid

### Guild & Roster Management
```
GET    /guild/roster            - Roster complet de la guilde avec spécialisations
GET    /guild/stats             - Statistiques de la guilde (répartition classes, spés, niveaux de maîtrise)
GET    /guild/availability      - Disponibilités du roster pour une période donnée
PUT    /guild/members/:userId/role - Changer le rôle d'un membre (Guild Master only)
DELETE /guild/members/:userId   - Exclure un membre (Guild Master only)
```

## Sécurité & Validation

### Input Sanitization
```typescript
// Validation avec Zod (recommandé)
import { z } from 'zod';

const CreateCharacterSchema = z.object({
  name: z.string().min(2).max(12).regex(/^[A-Za-z]+$/),
  level: z.number().int().min(1).max(80),
  class: z.enum(['Warrior', 'Paladin', /* ... */]),
  itemLevel: z.number().int().min(1).max(600).optional(),
  server: z.string().min(2).max(50).optional(),
  isMain: z.boolean(),
  notes: z.string().max(500).optional(),
  specializations: z.array(SpecializationSchema).min(1).max(4)
});

// Middleware de validation
function validateBody(schema: z.ZodSchema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors
        }
      });
    }
  };
}
```

### SQL Injection Prevention
```typescript
// Utiliser un ORM (Prisma recommandé) ou prepared statements
// Jamais de concatenation de strings SQL
// Validation stricte des paramètres

// ✅ Bon
const user = await prisma.user.findUnique({
  where: { email: sanitizedEmail }
});

// ❌ Mauvais
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

### CORS & Headers de sécurité
```typescript
// Configuration CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Headers de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

## Testing Strategy

### Tests unitaires recommandés
```typescript
// Tests des fonctions métier
describe('Character validation', () => {
  test('should validate WoW character name format', () => {
    expect(validateCharacterName('Thorgar')).toBe(true);
    expect(validateCharacterName('Thor123')).toBe(false);
  });
});

// Tests des endpoints
describe('POST /characters', () => {
  test('should create character with valid data', async () => {
    const response = await request(app)
      .post('/characters')
      .set('Authorization', `Bearer ${validToken}`)
      .send(validCharacterData);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### Tests d'intégration critiques
- Authentification et autorisation
- Inscription/désinscription aux raids
- Calcul de composition de raid
- Gestion des permissions par rôle
- Contraintes de base de données
