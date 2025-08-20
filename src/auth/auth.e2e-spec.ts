import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AuthModule } from './auth.module';
import { UserEntity } from '../user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { EGuildRoles } from '../shared/enums/Guilds';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let userRepository: jest.Mocked<Repository<UserEntity>>;

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

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '24h' },
        }),
        AuthModule,
      ],
    })
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue(mockUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    userRepository = moduleFixture.get(getRepositoryToken(UserEntity));

    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user successfully', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.user.firstName).toBe(registerDto.firstName);
      expect(response.body.user.lastName).toBe(registerDto.lastName);
    });

    it('should return 409 if user already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);

      expect(response.body.message).toBe('User with this email already exists');
    });

    it('should return 400 for invalid email', async () => {
      const invalidDto = { ...registerDto, email: 'invalid-email' };

      await request(app.getHttpServer()).post('/auth/register').send(invalidDto).expect(400);
    });

    it('should return 400 for weak password', async () => {
      const invalidDto = { ...registerDto, password: 'weak' };

      await request(app.getHttpServer()).post('/auth/register').send(invalidDto).expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login successfully with valid credentials', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginDto.email);
    });

    it('should return 401 for invalid credentials', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer()).post('/auth/login').send(loginDto).expect(401);
    });

    it('should return 401 for invalid email format', async () => {
      const invalidDto = { ...loginDto, email: 'invalid-email' };

      await request(app.getHttpServer()).post('/auth/login').send(invalidDto).expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should return user profile with valid JWT token', async () => {
      // First register a user to get a token
      userRepository.findOne.mockResolvedValueOnce(null); // For register check
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const registerResponse = await request(app.getHttpServer()).post('/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      });

      const token = registerResponse.body.access_token;

      // Mock findOne for profile endpoint
      userRepository.findOne.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe(mockUser.email);
      expect(response.body.firstName).toBe(mockUser.firstName);
      expect(response.body.lastName).toBe(mockUser.lastName);
    });

    it('should return 401 without JWT token', async () => {
      await request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should return 401 with invalid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
