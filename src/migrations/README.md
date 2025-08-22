# Database Migrations - API Refactoring

## Vue d'ensemble des changements

Cette série de migrations adapte la base de données pour correspondre au schema API défini pour le frontend.

### Migration 1: Refactoring User Entity

**Changements majeurs:**
- Suppression des champs: `username`, `region[]`
- Ajout des champs: `firstName`, `lastName`, `guildRole`, `emailVerified`
- Renommage: `password` → `passwordHash`
- Nouveaux contraintes: email unique, validation rôles guilde
- Index optimisé: email uniquement (suppression username)

**Impact:**
- **BREAKING**: Structure User complètement changée
- **Migration de données requise** pour les utilisateurs existants
- **Nouveau enum**: EGuildRoles avec valeurs standard

### Migration 2: Refactoring Guild Entity

**Changements majeurs:**
- Nom de table: `guild` → `guilds`
- Ajout du champ: `updatedAt`
- Correction relation: `@OneToMany` vers `memberships`
- Index et contraintes optimisés

**Impact:**
- **BREAKING**: Nom de table changé
- **Relations corrigées** avec guild-memberships

### Migration 3: Refactoring GuildMembership Entity

**Changements majeurs:**
- Nom de table: `guild_membership` → `guild_memberships`
- Type ID: `number` → `string` (UUID)
- Nouvelles contraintes: un seul membership actif par user
- Index unique: (user, status) WHERE status = 'ACTIVE'
- Valeurs enum actualisées: EGuildRoles et EGuildStatus

**Impact:**
- **BREAKING**: Structure PK changée
- **CONTRAINTE BUSINESS**: Un utilisateur = une guilde active max
- **Enum mis à jour**: Suppression de 'APPLICANT' dans EGuildRoles

## Scripts de migration

```bash
# Générer les migrations auto (après modifications entités)
npm run typeorm:generate src/migrations/RefactorUserGuildSystem

# Appliquer les migrations
npm run typeorm:run

# Rollback si nécessaire
npm run typeorm:revert
```

## Stratégie de migration données existantes

### Pour les Users existants:
```sql
-- Exemple de migration de données pour users
UPDATE users SET 
  "firstName" = SPLIT_PART(username, ' ', 1),
  "lastName" = COALESCE(SPLIT_PART(username, ' ', 2), 'Unknown'),
  "guildRole" = 'Member',
  "emailVerified" = false,
  "passwordHash" = password
WHERE "firstName" IS NULL;
```

### Pour les Guilds existantes:
```sql
-- Renommer table et ajouter colonnes
ALTER TABLE guild RENAME TO guilds;
ALTER TABLE guilds ADD COLUMN "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP;
```

### Pour les GuildMemberships:
```sql
-- Conversion IDs et contraintes
ALTER TABLE guild_membership RENAME TO guild_memberships;
-- Conversion number → UUID nécessite traitement spécial
```

## Validation post-migration

### Tests à effectuer:
1. **Users**: Tous ont firstName, lastName, guildRole valides
2. **Guilds**: Relations OneToMany fonctionnelles
3. **GuildMemberships**: Contrainte une guilde par user respectée
4. **Enums**: Toutes les valeurs respectent les nouveaux EGuildRoles/Status

### Requêtes de vérification:
```sql
-- Vérifier tous users ont les champs requis
SELECT COUNT(*) FROM users WHERE "firstName" IS NULL OR "lastName" IS NULL;

-- Vérifier contrainte une guilde par user
SELECT user_id, COUNT(*) 
FROM guild_memberships 
WHERE status = 'ACTIVE' 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Vérifier intégrité des enums
SELECT DISTINCT role FROM guild_memberships;
SELECT DISTINCT status FROM guild_memberships;
```

## Rollback Strategy

En cas de problème, procédure de rollback:

1. `npm run typeorm:revert` (répéter selon nombre migrations)
2. Restaurer backup BDD si migration data échouée
3. Revenir au code avant refactoring
4. Vérifier cohérence API/DB

## Notes importantes

⚠️ **ATTENTION**: Ces migrations sont BREAKING CHANGES
- Sauvegarder la BDD avant application
- Tester sur environnement de développement d'abord
- Planifier maintenance pour la production
- Prévoir rollback complet si nécessaire
