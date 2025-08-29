import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CookiesService } from '../common/services/cookie.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let cookiesService: jest.Mocked<CookiesService>;
  let mockResponse: Partial<Response>;

  // Datos mock reutilizables
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Usuario Test'
  };

  const mockAuthResponse: AuthResponseDto = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: mockUser
  };

  const mockCreateAuthDto: CreateAuthDto = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Usuario Test'
  };

  const mockLoginAuthDto: LoginAuthDto = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    // Mock del Response de Express
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };

    // Crear mocks de los servicios
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      validateToken: jest.fn(),
      refreshToken: jest.fn()
    };

    const mockCookiesService = {
      setCookies: jest.fn(),
      getCookies: jest.fn(),
      clearCookies: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService
        },
        {
          provide: CookiesService,
          useValue: mockCookiesService
        }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    cookiesService = module.get(CookiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición del controlador', () => {
    it('debería estar definido', () => {
      expect(controller).toBeDefined();
    });

    it('debería tener AuthService inyectado', () => {
      expect(authService).toBeDefined();
    });

    it('debería tener CookiesService inyectado', () => {
      expect(cookiesService).toBeDefined();
    });
  });

  describe('register', () => {
    it('debería registrar un usuario exitosamente', async () => {
      // Arrange
      authService.register.mockResolvedValue(mockAuthResponse);

      // Act
      await controller.register(mockCreateAuthDto, mockResponse as Response);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(mockCreateAuthDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
      
      expect(cookiesService.setCookies).toHaveBeenCalledWith(
        mockResponse,
        'access_token',
        mockAuthResponse.access_token
      );
      expect(cookiesService.setCookies).toHaveBeenCalledWith(
        mockResponse,
        'refresh_token',
        mockAuthResponse.refresh_token
      );
      expect(cookiesService.setCookies).toHaveBeenCalledTimes(2);
      
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAuthResponse);
    });

    it('debería manejar errores del servicio de autenticación', async () => {
      // Arrange
      const error = new Error('Email ya existe');
      authService.register.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.register(mockCreateAuthDto, mockResponse as Response)
      ).rejects.toThrow('Email ya existe');
      
      expect(authService.register).toHaveBeenCalledWith(mockCreateAuthDto);
      expect(cookiesService.setCookies).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('debería validar que se pase el DTO correcto', async () => {
      // Arrange
      authService.register.mockResolvedValue(mockAuthResponse);
      const invalidDto = { email: 'invalid' } as CreateAuthDto;

      // Act
      await controller.register(invalidDto, mockResponse as Response);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(invalidDto);
    });
  });

  describe('login', () => {
    it('debería hacer login exitosamente', async () => {
      // Arrange
      authService.login.mockResolvedValue(mockAuthResponse);

      // Act
      await controller.login(mockLoginAuthDto, mockResponse as Response);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(mockLoginAuthDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
      
      expect(cookiesService.setCookies).toHaveBeenCalledWith(
        mockResponse,
        'access_token',
        mockAuthResponse.access_token
      );
      expect(cookiesService.setCookies).toHaveBeenCalledWith(
        mockResponse,
        'refresh_token',
        mockAuthResponse.refresh_token
      );
      expect(cookiesService.setCookies).toHaveBeenCalledTimes(2);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAuthResponse);
    });

    it('debería manejar credenciales inválidas', async () => {
      // Arrange
      const error = new Error('Credenciales inválidas');
      authService.login.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.login(mockLoginAuthDto, mockResponse as Response)
      ).rejects.toThrow('Credenciales inválidas');
      
      expect(authService.login).toHaveBeenCalledWith(mockLoginAuthDto);
      expect(cookiesService.setCookies).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('debería manejar usuario inactivo', async () => {
      // Arrange
      const error = new Error('Usuario inactivo');
      authService.login.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.login(mockLoginAuthDto, mockResponse as Response)
      ).rejects.toThrow('Usuario inactivo');
      
      expect(authService.login).toHaveBeenCalledWith(mockLoginAuthDto);
    });

    it('debería validar que se pase el DTO correcto', async () => {
      // Arrange
      authService.login.mockResolvedValue(mockAuthResponse);
      const invalidDto = { email: 'test@example.com' } as LoginAuthDto;

      // Act
      await controller.login(invalidDto, mockResponse as Response);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(invalidDto);
    });
  });

  describe('logout', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('debería hacer logout exitosamente', () => {
      // Arrange
      authService.logout.mockReturnValue(undefined);

      // Act
      const result = controller.logout(userId, mockResponse as Response);

      // Assert
      expect(authService.logout).toHaveBeenCalledWith(userId);
      expect(authService.logout).toHaveBeenCalledTimes(1);
      
      expect(cookiesService.clearCookies).toHaveBeenCalledWith(mockResponse);
      expect(cookiesService.clearCookies).toHaveBeenCalledTimes(1);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Logout exitoso' });
    });

    it('debería manejar errores del servicio de logout', () => {
      // Arrange
      const error = new Error('Error al hacer logout');
      authService.logout.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => {
        controller.logout(userId, mockResponse as Response);
      }).toThrow('Error al hacer logout');
      
      expect(authService.logout).toHaveBeenCalledWith(userId);
      expect(cookiesService.clearCookies).not.toHaveBeenCalled();
    });

    it('debería limpiar cookies incluso si el servicio falla silenciosamente', () => {
      // Arrange - El servicio no lanza error pero falla internamente
      authService.logout.mockReturnValue(undefined);

      // Act
      controller.logout(userId, mockResponse as Response);

      // Assert
      expect(cookiesService.clearCookies).toHaveBeenCalledWith(mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Logout exitoso' });
    });

    it('debería validar que se pase un userId', () => {
      // Arrange
      authService.logout.mockReturnValue(undefined);
      const emptyUserId = '';

      // Act
      controller.logout(emptyUserId, mockResponse as Response);

      // Assert
      expect(authService.logout).toHaveBeenCalledWith(emptyUserId);
    });
  });

  describe('Integración entre servicios', () => {
    it('debería configurar cookies correctamente después del registro', async () => {
      // Arrange
      authService.register.mockResolvedValue(mockAuthResponse);

      // Act
      await controller.register(mockCreateAuthDto, mockResponse as Response);

      // Assert - Verificar que ambos servicios fueron llamados
      expect(authService.register).toHaveBeenCalledWith(mockCreateAuthDto);
      expect(cookiesService.setCookies).toHaveBeenCalledTimes(2);
      
      // Verificar que se configuraron ambas cookies
      expect(cookiesService.setCookies).toHaveBeenNthCalledWith(
        1,
        mockResponse,
        'access_token',
        mockAuthResponse.access_token
      );
      expect(cookiesService.setCookies).toHaveBeenNthCalledWith(
        2,
        mockResponse,
        'refresh_token',
        mockAuthResponse.refresh_token
      );
    });

    it('debería configurar cookies correctamente después del login', async () => {
      // Arrange
      authService.login.mockResolvedValue(mockAuthResponse);

      // Act
      await controller.login(mockLoginAuthDto, mockResponse as Response);

      // Assert - Verificar que ambos servicios fueron llamados
      expect(authService.login).toHaveBeenCalledWith(mockLoginAuthDto);
      expect(cookiesService.setCookies).toHaveBeenCalledTimes(2);
      
      // Verificar que se configuraron ambas cookies
      expect(cookiesService.setCookies).toHaveBeenNthCalledWith(
        1,
        mockResponse,
        'access_token',
        mockAuthResponse.access_token
      );
      expect(cookiesService.setCookies).toHaveBeenNthCalledWith(
        2,
        mockResponse,
        'refresh_token',
        mockAuthResponse.refresh_token
      );
    });

    it('debería limpiar cookies correctamente durante el logout', () => {
      // Arrange
      authService.logout.mockReturnValue(undefined);

      // Act
      controller.logout(mockUser.id, mockResponse as Response);

      // Assert - Verificar que ambos servicios fueron llamados
      expect(authService.logout).toHaveBeenCalledWith(mockUser.id);
      expect(cookiesService.clearCookies).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('Códigos de estado HTTP', () => {
    it('debería retornar 201 para registro exitoso', async () => {
      // Arrange
      authService.register.mockResolvedValue(mockAuthResponse);

      // Act
      await controller.register(mockCreateAuthDto, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('debería retornar 200 para login exitoso', async () => {
      // Arrange
      authService.login.mockResolvedValue(mockAuthResponse);

      // Act
      await controller.login(mockLoginAuthDto, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('debería retornar 200 para logout exitoso', () => {
      // Arrange
      authService.logout.mockReturnValue(undefined);

      // Act
      controller.logout(mockUser.id, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
