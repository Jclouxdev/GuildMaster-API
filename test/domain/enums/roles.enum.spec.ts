import { ERoles } from '../../../src/domain/enums/roles.enum';

describe('Roles Enum', () => {
  it('enum should have tank, healer, and dps roles', () => {
    // Arrange
    const expectedRoles = ['Tank', 'Healer', 'Dps', 'Support'];

    // Act
    const roles = Object.values(ERoles);

    // Assert
    expect(roles).toEqual(expect.arrayContaining(expectedRoles));
  });
});
