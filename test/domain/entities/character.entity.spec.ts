import { Character } from '../../../src/domain/entities/character.entity';

describe('Character Entity', () => {
  describe('canJoinRaid', () => {
    it('should return true if character level is at least 80', () => {
      // Arrange
      const character = new Character();
      character.level = 80;

      // Act
      const result = character.canJoinRaid();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if character level is below 80', () => {
      // Arrange
      const character = new Character();
      character.level = 79;

      // Act
      const result = character.canJoinRaid();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasRequiredItemLevel', () => {
    it('should return true if item level meets the requirement', () => {
      // Arrange
      const character = new Character();
      character.itemLevel = 430;
      const requiredItemLevel = 420;

      // Act
      const result = character.hasRequiredItemLevel(requiredItemLevel);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if item level is below the requirement', () => {
      // Arrange
      const character = new Character();
      character.itemLevel = 415;
      const requiredItemLevel = 420;

      // Act
      const result = character.hasRequiredItemLevel(requiredItemLevel);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isRoleEligible', () => {
    it('should return true if specialization matches role', () => {
      // Arrange
      const character = new Character();
      character.class = 'Warrior';
      character.specializationId = 72; // Arms spec ID
      const role = 'DPS';

      // Act
      const result = character.isRoleEligible(role);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if specialization does not match role', () => {
      // Arrange
      const character = new Character();
      character.class = 'Warrior';
      character.specializationId = 73; // Protection spec ID
      const role = 'DPS';

      // Act
      const result = character.isRoleEligible(role);

      // Assert
      expect(result).toBe(false);
    });
  });
});
