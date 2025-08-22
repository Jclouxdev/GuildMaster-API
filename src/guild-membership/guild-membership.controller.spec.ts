import { Test, TestingModule } from '@nestjs/testing';
import { GuildMembershipController } from './guild-membership.controller';
import { GuildMembershipService } from './guild-membership.service';
import { CreateGuildMembershipDto } from './dto/create-guild-membership.dto';
import { UpdateGuildMembershipDto } from './dto/update-guild-membership.dto';
import { EGuildRoles, EGuildStatus } from '../shared/enums/Guilds';

describe('GuildMembershipController', () => {
  let controller: GuildMembershipController;
  let service: GuildMembershipService;

  const mockMembership = {
    id: 'membership-id',
    user: { id: 'user-id', firstName: 'John', lastName: 'Doe', email: 'user@test.com' },
    guild: { id: 'guild-id', name: 'Test Guild', description: 'Test Description' },
    role: EGuildRoles.MEMBER,
    applicationDate: new Date(),
    joinDate: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuildMembershipController],
      providers: [
        {
          provide: GuildMembershipService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findAllByGuildId: jest.fn(),
            findAllByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GuildMembershipController>(GuildMembershipController);
    service = module.get<GuildMembershipService>(GuildMembershipService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a guild membership', async () => {
      const createDto: CreateGuildMembershipDto = {
        userId: 'user-id',
        guildId: 'guild-id',
        role: EGuildRoles.MEMBER,
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockMembership as any);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockMembership);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all guild memberships', async () => {
      const mockMemberships = [mockMembership];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockMemberships as any);

      const result = await controller.findAll();

      expect(result).toEqual(mockMemberships);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a guild membership', async () => {
      const updateDto: UpdateGuildMembershipDto = {
        role: EGuildRoles.OFFICER,
        status: EGuildStatus.ACTIVE,
      };

      const updateResult = { affected: 1 };
      jest.spyOn(service, 'update').mockResolvedValue(updateResult as any);

      const result = await controller.update('membership-id', updateDto);

      expect(result).toEqual(updateResult);
      expect(service.update).toHaveBeenCalledWith('membership-id', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a guild membership', async () => {
      const deleteResult = { affected: 1 };
      jest.spyOn(service, 'remove').mockResolvedValue(deleteResult as any);

      const result = await controller.remove('membership-id');

      expect(result).toEqual(deleteResult);
      expect(service.remove).toHaveBeenCalledWith('membership-id');
    });
  });

  describe('findByGuildId', () => {
    it('should return memberships by guild id', async () => {
      const mockMemberships = [mockMembership];

      jest.spyOn(service, 'findAllByGuildId').mockResolvedValue(mockMemberships as any);

      const result = await controller.findAllByGuild('guild-id');

      expect(result).toEqual(mockMemberships);
      expect(service.findAllByGuildId).toHaveBeenCalledWith('guild-id');
    });
  });

  describe('findByUserId', () => {
    it('should return memberships by user id', async () => {
      const mockMemberships = [mockMembership];

      jest.spyOn(service, 'findAllByUserId').mockResolvedValue(mockMemberships as any);

      const result = await controller.findAllByUser('user-id');

      expect(result).toEqual(mockMemberships);
      expect(service.findAllByUserId).toHaveBeenCalledWith('user-id');
    });
  });
});
