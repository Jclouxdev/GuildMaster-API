import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';
import { UserEntity } from '../../user/entities/user.entity';
import { JwtPayload } from '../interfaces/auth.interface';
import { EGuildRoles } from '../../shared/enums/Guilds';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: jest.Mocked<AuthService>;

  const mockUser: UserEntity = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    passwordHash: 'hashedPassword',
    guildRole: EGuildRoles.MEMBER,
    emailVerified: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    createdGuilds: [],
    guildMemberships: [],
    hashPasswordBeforeInsert: jest.fn(),
    hashPasswordBeforeUpdate: jest.fn(),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    register: jest.fn(),
    login: jest.fn(),
    findUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    const payload: JwtPayload = {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
    };

    it('should return user when token payload is valid', async () => {
      authService.findUserById.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(authService.findUserById).toHaveBeenCalledWith(payload.sub);
      expect(result).toBe(mockUser);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      authService.findUserById.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      expect(authService.findUserById).toHaveBeenCalledWith(payload.sub);
    });
  });
});
