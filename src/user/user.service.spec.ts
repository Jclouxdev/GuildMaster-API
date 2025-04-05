import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';

describe('UsersService', () => {
  let usersService: UserService;
  let userRepository: Partial<Record<keyof Repository<UserEntity>, jest.Mock>>;

  beforeEach(async () => {
    // Mock du repository
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    // Configuration du module de test
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepository,
        },
      ],
    }).compile();

    // Récupération des services
    usersService = module.get<UserService>(UserService);
  });

  it('should create a new user successfully', async () => {
    // Préparation des données de test
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      region: 'EU',
    };

    // Mock des méthodes du repository
    (userRepository.findOne as jest.Mock).mockResolvedValue(null);
    (userRepository.create as jest.Mock).mockReturnValue(createUserDto);
    (userRepository.save as jest.Mock).mockResolvedValue({
      ...createUserDto,
      id: 'some-uuid',
    });

    // Exécution du test
    const createdUser = await usersService.create(createUserDto);

    // Vérifications
    expect(createdUser).toBeDefined();
    expect(createdUser.username).toBe(createUserDto.username);
    expect(createdUser.email).toBe(createUserDto.email);
  });

  it('should throw an error when creating a user with existing email', async () => {
    // Préparation des données de test
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      email: 'existing@example.com',
      password: 'Password123!',
      region: 'EU',
    };

    // Mock d'un utilisateur existant
    (userRepository.findOne as jest.Mock).mockResolvedValue({
      email: 'existing@example.com',
    });

    // Vérification que l'erreur est bien levée
    await expect(usersService.create(createUserDto)).rejects.toThrow(ConflictException);
  });
});
