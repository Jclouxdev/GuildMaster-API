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
    71: ERoles.Dps, // Arms
    72: ERoles.Dps, // Fury
    73: ERoles.Tank, // Protection
    // Paladin specs
    65: ERoles.Tank, // Protection
    66: ERoles.Healer, // Holy
    70: ERoles.Dps, // Retribution
    // Etc. pour toutes les autres classes/specs
  };

  canJoinRaid(): boolean {
    return this.level >= 70;
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
