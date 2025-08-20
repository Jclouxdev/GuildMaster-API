import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { GuildMembershipService } from './guild-membership.service';
import { GuildMembershipEntity } from './entities/guild-membership.entity';
import { UserEntity } from '../user/entities/user.entity';
import { GuildEntity } from '../guild/entities/guild.entity';
import { CreateGuildMembershipDto } from './dto/create-guild-membership.dto';
import { EGuildRoles, EGuildStatus } from '../shared/enums/Guilds';

describe('GuildMembershipService', () => {
  let service: GuildMembershipService;
  let guildMembershipRepository: Repository<GuildMembershipEntity>;
  let userRepository: Repository<UserEntity>;
  let guildRepository: Repository<GuildEntity>;

  const mockUser: UserEntity = {
    id: 'user-id',
    email: 'user@test.com',
    firstName: 'John',
    lastName: 'Doe',
    guildRole: EGuildRoles.MEMBER,
    passwordHash: 'hash',
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdGuilds: [],
    guildMemberships: [],
    hashPasswordBeforeInsert: jest.fn(),
    hashPasswordBeforeUpdate: jest.fn(),
  };

  const mockGuild: GuildEntity = {
    id: 'guild-id',
    name: 'Test Guild',
    description: 'Test Description',
    owner: mockUser,
    creator: mockUser,
    region: null,
    maximumMembersAllowed: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    memberships: [],
    tags: [],
    isFull: jest.fn().mockReturnValue(false),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuildMembershipService,
        {
          provide: getRepositoryToken(GuildMembershipEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(GuildEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GuildMembershipService>(GuildMembershipService);
    guildMembershipRepository = module.get<Repository<GuildMembershipEntity>>(
      getRepositoryToken(GuildMembershipEntity),
    );
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    guildRepository = module.get<Repository<GuildEntity>>(getRepositoryToken(GuildEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a guild membership', async () => {
      const createDto: CreateGuildMembershipDto = {
        userId: 'user-id',
        guildId: 'guild-id',
        role: EGuildRoles.MEMBER,
      };

      const mockMembership = {
        id: 'membership-id',
        user: mockUser,
        guild: mockGuild,
        role: EGuildRoles.MEMBER,
        status: EGuildStatus.PENDING,
        applicationDate: new Date(),
        joinDate: null,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(guildRepository, 'findOne').mockResolvedValue(mockGuild);
      jest.spyOn(guildMembershipRepository, 'create').mockReturnValue(mockMembership as any);
      jest.spyOn(guildMembershipRepository, 'save').mockResolvedValue(mockMembership as any);
      
      // Mock des méthodes privées via le repository
      jest.spyOn(guildMembershipRepository, 'find').mockResolvedValue([]); // Pour getActiveGuildMemberships
      jest.spyOn(guildMembershipRepository, 'findOne').mockResolvedValue(null); // Pour checkExistingMembership

      const result = await service.create(createDto);

      expect(result).toEqual(mockMembership);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id' } });
      expect(guildRepository.findOne).toHaveBeenCalledWith({ where: { id: 'guild-id' } });
    });

    it('should throw NotFoundException if user not found', async () => {
      const createDto: CreateGuildMembershipDto = {
        userId: 'invalid-user-id',
        guildId: 'guild-id',
        role: EGuildRoles.MEMBER,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all guild memberships', async () => {
      const mockMemberships = [
        {
          id: 'membership-id',
          user: mockUser,
          guild: mockGuild,
          role: EGuildRoles.MEMBER,
          status: EGuildStatus.ACTIVE,
        },
      ];

      jest.spyOn(guildMembershipRepository, 'find').mockResolvedValue(mockMemberships as any);

      const result = await service.findAll();

      expect(result).toEqual(mockMemberships);
      expect(guildMembershipRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'guild'],
        select: {
          user: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
          guild: {
            id: true,
            name: true,
            description: true,
          },
        },
      });
    });
  });
});
