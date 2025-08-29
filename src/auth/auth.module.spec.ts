import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { getModelToken } from '@nestjs/sequelize';
import { Auth } from './models/auth.model';
import { CookiesService } from '../common/services/cookie.service';
import { JwtService } from '@nestjs/jwt';

// Mock completo de envs incluyendo jwt_secret
jest.mock('../settings/envs', () => ({
  envs: {
    jwt_secret: 'test-jwt-secret-key-for-testing',
    db_host: 'localhost',
    db_port: 5436,
    db_user: 'postgres',
    db_password: 'password',
    db_name: 'cmpc_bookstore',
  },
}));

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
    .overrideProvider(getModelToken(Auth))
    .useValue({
      findOne: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    })
    .overrideProvider(CookiesService)
    .useValue({
      getCookies: jest.fn(),
      setCookies: jest.fn(),
    })
    .overrideProvider(JwtService)
    .useValue({
      sign: jest.fn(),
      verify: jest.fn(),
    })
    .compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide AuthService', () => {
    const authService = module.get<AuthService>(AuthService);
    expect(authService).toBeDefined();
    expect(authService).toBeInstanceOf(AuthService);
  });

  it('should provide AuthController', () => {
    const authController = module.get<AuthController>(AuthController);
    expect(authController).toBeDefined();
    expect(authController).toBeInstanceOf(AuthController);
  });

  it('should provide JwtStrategy', () => {
    const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    expect(jwtStrategy).toBeDefined();
    expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
  });

  it('should have all required providers', () => {
    expect(module.get<AuthService>(AuthService)).toBeDefined();
    expect(module.get<AuthController>(AuthController)).toBeDefined();
    expect(module.get<JwtStrategy>(JwtStrategy)).toBeDefined();
  });

  it('should compile successfully', () => {
    expect(module).toBeDefined();
    expect(module.get<AuthService>(AuthService)).toBeInstanceOf(AuthService);
  });
});