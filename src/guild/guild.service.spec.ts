import { Test, TestingModule } from '@nestjs/testing';
import { GuildService } from './guild.service';
import { Repository } from 'typeorm';
import { GuildEntity } from './entities/guild.entity';
import { UserEntity } from '../user/entities/user.entity'; // Ajoutez cette import
import { getRepositoryToken } from '@nestjs/typeorm';
import { ERegions } from '../shared/enums/Regions';
import { CreateGuildDto } from './dto/create-guild.dto';

const UUID = '00000000-0000-0000-0000-000000000001';

describe('GuildService', () => {
  let service: GuildService;
  let guildRepository: Partial<Record<keyof Repository<GuildEntity>, jest.Mock>>;
  let userRepository: Partial<Record<keyof Repository<UserEntity>, jest.Mock>>; // Ajoutez cette ligne

  beforeEach(async () => {
    guildRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    // Créez un mock pour le UserEntityRepository
    userRepository = {
      findOne: jest.fn(),
      // Ajoutez d'autres méthodes selon les besoins de votre GuildService
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuildService,
        {
          provide: getRepositoryToken(GuildEntity),
          useValue: guildRepository,
        },
        {
          // Ajoutez cette configuration pour le UserEntityRepository
          provide: getRepositoryToken(UserEntity),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<GuildService>(GuildService);
  });

  it('should create a new guild successfully', async () => {
    // Preparation des donnees de test
    const createGuildDto: CreateGuildDto = {
      name: 'testGuild',
      description: 'testDescription',
      ownerId: UUID,
      region: ERegions.EU,
      maximumMembersAllowed: 100,
      tags: ['testTag'],
    };

    // Mock des méthodes du repository
    (guildRepository.findOne as jest.Mock).mockResolvedValue(null);
    (guildRepository.create as jest.Mock).mockReturnValue(createGuildDto);
    (guildRepository.save as jest.Mock).mockResolvedValue({
      ...createGuildDto,
      id: 1,
    });

    // Mock de findOne pour userRepository si nécessaire pour votre logique
    (userRepository.findOne as jest.Mock).mockResolvedValue({
      id: UUID,
      // autres propriétés nécessaires d'un UserEntity
    });

    // Execution du test
    const createdGuild = await service.create(createGuildDto);

    // Verifications
    expect(createdGuild).toBeDefined();
    expect(createdGuild.name).toBe(createGuildDto.name);
  });
});
