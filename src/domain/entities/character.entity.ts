import { ERoles } from '../enums/roles.enum';

export class Character {
  id: string;
  name: string;
  class: string;
  level: number;
  itemLevel: number;
  specializationId: number;
  guildId?: string;

  // Map des spécialisations et leurs rôles
  private static readonly SPEC_ROLES = {
    // Warrior specs
    71: ERoles.DPS, // Arms
    72: ERoles.DPS, // Fury
    73: ERoles.TANK, // Protection
    // Paladin specs
    65: ERoles.TANK, // Protection
    66: ERoles.HEALER, // Holy
    70: ERoles.DPS, // Retribution
    // Etc. pour toutes les autres classes/specs
  };

  canJoinRaid(): boolean {
    return this.level >= 80;
  }

  hasRequiredItemLevel(requiredItemLevel: number): boolean {
    return this.itemLevel >= requiredItemLevel;
  }

  isRoleEligible(role: string): boolean {
    const specRole = Character.SPEC_ROLES[this.specializationId];
    return specRole === role;
  }

  canFulfillRaidPosition(role: string, requiredItemLevel: number): boolean {
    return (
      this.canJoinRaid() &&
      this.hasRequiredItemLevel(requiredItemLevel) &&
      this.isRoleEligible(role)
    );
  }
}
