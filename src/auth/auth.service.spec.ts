import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Auth } from './models/auth.model';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthResponse } from './interfaces';

// Mock de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const bcryptMock = {
  hash: bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>,
  compare: bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>,
};

// Mock de variables de entorno
jest.mock('../settings/envs', () => ({
  envs: {
    jwt_secret: 'test-jwt-secret',
    jwt_refresh_secret: 'test-refresh-secret',
  },
}));

describe('AuthService', () => {
  let service: AuthService;
  let authModel: jest.Mocked<typeof Auth>;
  let jwtService: jest.MockedObject<JwtService>;

  // Datos falsos de usuario
  const usuarioMock = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Usuario de prueba',
    refreshToken: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    update: jest.fn(),
  };

  const crearAuthDto: CreateAuthDto = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Usuario de prueba',
  };

  const loginAuthDto: LoginAuthDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const respuestaAuthMock: AuthResponse = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: {
      id: usuarioMock.id,
      email: usuarioMock.email,
      name: usuarioMock.name,
    },
  };

  beforeEach(async () => {
    const modeloAuthMock = {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const jwtServiceMock = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(Auth),
          useValue: modeloAuthMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authModel = module.get(getModelToken(Auth));
    jwtService = module.get<JwtService>(JwtService) as jest.MockedObject<JwtService>;

    // Resetear mocks
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('registro', () => {
    it('debería registrar un nuevo usuario correctamente', async () => {
      authModel.findOne.mockResolvedValue(null);
      bcryptMock.hash.mockResolvedValue('hashedPassword123' as never);
      authModel.create.mockResolvedValue(usuarioMock as any);
      usuarioMock.update.mockResolvedValue(usuarioMock as any);
      jwtService.sign
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');

      const resultado = await service.register(crearAuthDto);

      expect(authModel.findOne).toHaveBeenCalledWith({
        where: { email: crearAuthDto.email },
      });
      expect(bcryptMock.hash).toHaveBeenCalledWith(crearAuthDto.password, 10);
      expect(authModel.create).toHaveBeenCalledWith({
        email: crearAuthDto.email,
        password: 'hashedPassword123',
        name: crearAuthDto.name,
      });
      expect(resultado).toEqual(respuestaAuthMock);
    });

    it('debería lanzar ConflictException si el correo ya existe', async () => {
      authModel.findOne.mockResolvedValue(usuarioMock as any);

      await expect(service.register(crearAuthDto))
        .rejects
        .toThrow(ConflictException);
      
      expect(authModel.findOne).toHaveBeenCalledWith({
        where: { email: crearAuthDto.email },
      });
      expect(bcryptMock.hash).not.toHaveBeenCalled();
      expect(authModel.create).not.toHaveBeenCalled();
    });

    it('debería manejar errores al hashear contraseña', async () => {
      authModel.findOne.mockResolvedValue(null);
      bcryptMock.hash.mockRejectedValue(new Error('Error al hashear') as never);

      await expect(service.register(crearAuthDto))
        .rejects
        .toThrow('Error al hashear');
    });
  });

  describe('login', () => {
    it('debería iniciar sesión correctamente con credenciales válidas', async () => {
      authModel.findOne.mockResolvedValue(usuarioMock as any);
      bcryptMock.compare.mockResolvedValue(true as never);
      usuarioMock.update.mockResolvedValue(usuarioMock as any);
      jwtService.sign
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');

      const resultado = await service.login(loginAuthDto);

      expect(authModel.findOne).toHaveBeenCalledWith({
        where: { email: loginAuthDto.email, isActive: true },
      });
      expect(bcryptMock.compare).toHaveBeenCalledWith(
        loginAuthDto.password,
        usuarioMock.password
      );
      expect(resultado).toEqual(respuestaAuthMock);
    });

    it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
      authModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginAuthDto))
        .rejects
        .toThrow(UnauthorizedException);
      
      expect(bcryptMock.compare).not.toHaveBeenCalled();
    });

    it('debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      authModel.findOne.mockResolvedValue(usuarioMock as any);
      bcryptMock.compare.mockResolvedValue(false as never);

      await expect(service.login(loginAuthDto))
        .rejects
        .toThrow(UnauthorizedException);
      
      expect(bcryptMock.compare).toHaveBeenCalledWith(
        loginAuthDto.password,
        usuarioMock.password
      );
    });

    it('debería lanzar UnauthorizedException si el usuario está inactivo', async () => {
      authModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginAuthDto))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('validarToken', () => {
    const tokenMock = 'valid-jwt-token';
    const payloadMock = { sub: usuarioMock.id, email: usuarioMock.email };

    it('debería devolver true si el token es válido y el usuario está activo', async () => {
      jwtService.verify.mockReturnValue(payloadMock);
      authModel.findByPk.mockResolvedValue(usuarioMock as any);

      const resultado = await service.validateToken(tokenMock);

      expect(jwtService.verify).toHaveBeenCalledWith(tokenMock, {
        secret: 'test-jwt-secret',
      });
      expect(authModel.findByPk).toHaveBeenCalledWith(payloadMock.sub);
      expect(resultado).toBe(true);
    });

    it('debería devolver false si el token es inválido', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      const resultado = await service.validateToken('invalid-token');

      expect(resultado).toBe(false);
      expect(authModel.findByPk).not.toHaveBeenCalled();
    });

    it('debería devolver false si el usuario no existe', async () => {
      jwtService.verify.mockReturnValue(payloadMock);
      authModel.findByPk.mockResolvedValue(null);

      const resultado = await service.validateToken(tokenMock);

      expect(resultado).toBe(false);
    });

    it('debería devolver false si el usuario está inactivo', async () => {
      const usuarioInactivo = { ...usuarioMock, isActive: false };
      jwtService.verify.mockReturnValue(payloadMock);
      authModel.findByPk.mockResolvedValue(usuarioInactivo as any);

      const resultado = await service.validateToken(tokenMock);

      expect(resultado).toBe(false);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenMock = 'valid-refresh-token';
    const payloadMock = { sub: usuarioMock.id, email: usuarioMock.email };

    it('debería refrescar el token correctamente', async () => {
      const usuarioConRefresh = { ...usuarioMock, refreshToken: refreshTokenMock };
      jwtService.verify.mockReturnValue(payloadMock);
      authModel.findOne.mockResolvedValue(usuarioConRefresh as any);
      usuarioConRefresh.update = jest.fn().mockResolvedValue(usuarioConRefresh);
      jwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const resultado = await service.refreshToken(refreshTokenMock);

      expect(jwtService.verify).toHaveBeenCalledWith(refreshTokenMock, {
        secret: 'test-refresh-secret',
      });
      expect(authModel.findOne).toHaveBeenCalledWith({
        where: {
          id: payloadMock.sub,
          refreshToken: refreshTokenMock,
          isActive: true,
        },
      });
      expect(resultado.access_token).toBe('new-access-token');
      expect(resultado.refresh_token).toBe('new-refresh-token');
    });

    it('debería lanzar UnauthorizedException si el refresh token es inválido', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      await expect(service.refreshToken('invalid-refresh-token'))
        .rejects
        .toThrow(UnauthorizedException);
      
      expect(authModel.findOne).not.toHaveBeenCalled();
    });

    it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
      jwtService.verify.mockReturnValue(payloadMock);
      authModel.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(refreshTokenMock))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('debería cerrar sesión correctamente', async () => {
      const userId = usuarioMock.id;
      authModel.update.mockResolvedValue([1] as any);

      await service.logout(userId);

      expect(authModel.update).toHaveBeenCalledWith(
        { refreshToken: null },
        { where: { id: userId } }
      );
    });

    it('debería manejar logout aunque el usuario no exista', async () => {
      const userId = 'usuario-no-existente';
      authModel.update.mockResolvedValue([0] as any);

      await service.logout(userId);

      expect(authModel.update).toHaveBeenCalledWith(
        { refreshToken: null },
        { where: { id: userId } }
      );
    });
  });

  describe('generateTokens (probado a través de métodos públicos)', () => {
    it('debería generar tokens con el payload y expiración correctos', async () => {
      authModel.findOne.mockResolvedValue(null);
      bcryptMock.hash.mockResolvedValue('hashedPassword' as never);
      authModel.create.mockResolvedValue(usuarioMock as any);
      usuarioMock.update.mockResolvedValue(usuarioMock as any);
      
      const payloadEsperado = { sub: usuarioMock.id, email: usuarioMock.email };
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      await service.register(crearAuthDto);

      expect(jwtService.sign).toHaveBeenCalledWith(payloadEsperado, {
        secret: 'test-jwt-secret',
        expiresIn: '1h',
      });
      expect(jwtService.sign).toHaveBeenCalledWith(payloadEsperado, {
        secret: 'test-refresh-secret',
        expiresIn: '7d',
      });
      expect(usuarioMock.update).toHaveBeenCalledWith({ refreshToken: 'refresh-token' });
    });
  });
});
