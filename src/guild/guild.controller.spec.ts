import { Test, TestingModule } from '@nestjs/testing';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';

describe('GuildController', () => {
  let controller: GuildController;
  let guildServiceMock: Partial<GuildService>;

  beforeEach(async () => {
    guildServiceMock = {
      create: jest.fn(),
      // findAll: jest.fn(),
      // findOne: jest.fn(),
      // Autres méthodes nécessaires
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuildController],
      providers: [
        {
          provide: GuildService,
          useValue: guildServiceMock,
        },
      ],
    }).compile();

    controller = module.get<GuildController>(GuildController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
