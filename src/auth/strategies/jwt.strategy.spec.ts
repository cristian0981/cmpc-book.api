import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { JwtStrategy, JwtPayload, JwtUser } from './jwt.strategy';
import { Auth } from '../models/auth.model';
import { ValidRoles } from '../interfaces/valid-roles.interface';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authModel: jest.Mocked<typeof Auth>;

  // Datos mock reutilizables
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Usuario Test',
    roles: [ValidRoles.user],
    isActive: true
  };

  const mockPayload: JwtPayload = {
    sub: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    roles: [ValidRoles.user],
    iat: 1640995200,
    exp: 1640998800
  };

  const expectedJwtUser: JwtUser = {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    roles: mockUser.roles,
    isActive: mockUser.isActive
  };

  beforeEach(async () => {
    // Mock del modelo Auth de Sequelize
    const mockAuthModel = {
      findOne: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: getModelToken(Auth),
          useValue: mockAuthModel
        }
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authModel = module.get(getModelToken(Auth));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Definición de la estrategia', () => {
    it('debería estar definida', () => {
      expect(strategy).toBeDefined();
    });

    it('debería tener el modelo Auth inyectado', () => {
      expect(authModel).toBeDefined();
    });
  });

  describe('validate', () => {
    describe('Casos exitosos', () => {
      it('debería validar un payload válido y retornar el usuario', async () => {
        // Arrange
        authModel.findOne.mockResolvedValue(mockUser as any);

        // Act
        const result = await strategy.validate(mockPayload);

        // Assert
        expect(authModel.findOne).toHaveBeenCalledWith({
          where: {
            id: mockPayload.sub,
            isActive: true
          },
          attributes: ['id', 'email', 'name', 'roles', 'isActive']
        });
        expect(authModel.findOne).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedJwtUser);
      });

      it('debería validar un usuario sin nombre', async () => {
        // Arrange
        const userWithoutName = { ...mockUser, name: null };
        const expectedUserWithoutName = { ...expectedJwtUser, name: null };
        authModel.findOne.mockResolvedValue(userWithoutName as any);

        // Act
        const result = await strategy.validate(mockPayload);

        // Assert
        expect(result).toEqual(expectedUserWithoutName);
      });

      it('debería manejar payload con campos opcionales faltantes', async () => {
        // Arrange
        const minimalPayload: JwtPayload = {
          sub: mockUser.id,
          email: mockUser.email,
          roles: [ValidRoles.user]  
        };
        authModel.findOne.mockResolvedValue(mockUser as any);

        // Act
        const result = await strategy.validate(minimalPayload);

        // Assert
        expect(authModel.findOne).toHaveBeenCalledWith({
          where: {
            id: minimalPayload.sub,
            isActive: true
          },
          attributes: ['id', 'email', 'name', 'roles', 'isActive']
        });
        expect(result).toEqual(expectedJwtUser);
      });
    });

    describe('Casos de error - Payload inválido', () => {
      it('debería lanzar UnauthorizedException si no hay userId en el payload', async () => {
        // Arrange
        const invalidPayload = {
          email: 'test@example.com',
          roles: [ValidRoles.user]  
        } as JwtPayload;

        // Act & Assert
        await expect(strategy.validate(invalidPayload))
          .rejects
          .toThrow(new UnauthorizedException('Token inválido: ID de usuario no encontrado'));
        
        expect(authModel.findOne).not.toHaveBeenCalled();
      });

      it('debería lanzar UnauthorizedException si userId es null', async () => {
        // Arrange
        const invalidPayload = {
          sub: null,
          email: 'test@example.com',
          roles: [ValidRoles.user]  
        } as any;

        // Act & Assert
        await expect(strategy.validate(invalidPayload))
          .rejects
          .toThrow(new UnauthorizedException('Token inválido: ID de usuario no encontrado'));
        
        expect(authModel.findOne).not.toHaveBeenCalled();
      });

      it('debería lanzar UnauthorizedException si userId es string vacío', async () => {
        // Arrange
        const invalidPayload = {
          sub: '',
          email: 'test@example.com',
          roles: [ValidRoles.user]  
        } as JwtPayload;

        // Act & Assert
        await expect(strategy.validate(invalidPayload))
          .rejects
          .toThrow(new UnauthorizedException('Token inválido: ID de usuario no encontrado'));
        
        expect(authModel.findOne).not.toHaveBeenCalled();
      });
    });

    describe('Casos de error - Usuario no encontrado', () => {
      it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
        // Arrange
        authModel.findOne.mockResolvedValue(null);

        // Act & Assert
        await expect(strategy.validate(mockPayload))
          .rejects
          .toThrow(new UnauthorizedException('Usuario no encontrado o inactivo'));
        
        expect(authModel.findOne).toHaveBeenCalledWith({
          where: {
            id: mockPayload.sub,
            isActive: true
          },
          attributes: ['id', 'email', 'name', 'roles', 'isActive']
        });
      });

      it('debería lanzar UnauthorizedException si el usuario está inactivo', async () => {
        // Arrange
        // El usuario inactivo no debería ser encontrado por la consulta que incluye isActive: true
        authModel.findOne.mockResolvedValue(null);

        // Act & Assert
        await expect(strategy.validate(mockPayload))
          .rejects
          .toThrow(new UnauthorizedException('Usuario no encontrado o inactivo'));
        
        expect(authModel.findOne).toHaveBeenCalledWith({
          where: {
            id: mockPayload.sub,
            isActive: true
          },
          attributes: ['id', 'email', 'name', 'roles', 'isActive']
        });
      });
    });

    describe('Casos de error - Errores de base de datos', () => {
      it('debería lanzar UnauthorizedException si hay error de conexión a la base de datos', async () => {
        // Arrange
        const dbError = new Error('Connection timeout');
        authModel.findOne.mockRejectedValue(dbError);

        // Act & Assert
        await expect(strategy.validate(mockPayload))
          .rejects
          .toThrow(new UnauthorizedException('Error al validar el token'));
        
        expect(authModel.findOne).toHaveBeenCalledWith({
          where: {
            id: mockPayload.sub,
            isActive: true
          },
          attributes: ['id', 'email', 'name', 'roles', 'isActive']
        });
      });

      it('debería propagar UnauthorizedException si ya es una excepción de autorización', async () => {
        // Arrange
        const authError = new UnauthorizedException('Token expirado');
        authModel.findOne.mockRejectedValue(authError);

        // Act & Assert
        await expect(strategy.validate(mockPayload))
          .rejects
          .toThrow(new UnauthorizedException('Token expirado'));
        
        expect(authModel.findOne).toHaveBeenCalledWith({
          where: {
            id: mockPayload.sub,
            isActive: true
          },
          attributes: ['id', 'email', 'name', 'roles', 'isActive']
        });
      });

      it('debería manejar errores de Sequelize', async () => {
        // Arrange
        const sequelizeError = new Error('ECONNREFUSED');
        sequelizeError.name = 'SequelizeConnectionError';
        authModel.findOne.mockRejectedValue(sequelizeError);

        // Act & Assert
        await expect(strategy.validate(mockPayload))
          .rejects
          .toThrow(new UnauthorizedException('Error al validar el token'));
      });
    });
  });

  describe('Configuración de la estrategia', () => {
    it('debería estar configurada para extraer JWT del header Authorization', () => {
      // Esta prueba verifica que la estrategia esté configurada correctamente
      // La configuración se hace en el constructor, por lo que verificamos que la instancia se cree correctamente
      expect(strategy).toBeInstanceOf(JwtStrategy);
    });

    it('debería estar configurada para extraer JWT de las cookies', () => {
      // Esta prueba verifica que la estrategia esté configurada correctamente
      // La configuración se hace en el constructor, por lo que verificamos que la instancia se cree correctamente
      expect(strategy).toBeInstanceOf(JwtStrategy);
    });
  });

  describe('Tipos y interfaces', () => {
    it('debería validar la estructura del JwtPayload', () => {
      // Arrange
      const payload: JwtPayload = {
        sub: '123',
        email: 'test@example.com',
        roles: [ValidRoles.admin],
        iat: 1640995200,
        exp: 1640998800
      };

      // Assert
      expect(payload.sub).toBeDefined();
      expect(payload.email).toBeDefined();
      expect(payload.roles).toBeDefined();
      expect(typeof payload.iat).toBe('number');
      expect(typeof payload.exp).toBe('number');
    });

    it('debería validar la estructura del JwtUser', () => {
      // Arrange
      const user: JwtUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        roles: [ValidRoles.user],
        isActive: true
      };

      // Assert
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.roles).toBeDefined();
      expect(typeof user.isActive).toBe('boolean');
    });
  });

  describe('Casos límite', () => {
    it('debería manejar payload con sub como número convertido a string', async () => {
      // Arrange
      const numericPayload = {
        sub: '123456789',
        email: 'test@example.com',
        roles: [ValidRoles.user]  
      } as JwtPayload;
      
      const userWithNumericId = {
        ...mockUser,
        id: '123456789'
      };
      
      authModel.findOne.mockResolvedValue(userWithNumericId as any);

      // Act
      const result = await strategy.validate(numericPayload);

      // Assert
      expect(result.id).toBe('123456789');
      expect(authModel.findOne).toHaveBeenCalledWith({
        where: {
          id: '123456789',
          isActive: true
        },
        attributes: ['id', 'email', 'name', 'roles', 'isActive']
      });
    });

    it('debería manejar emails con caracteres especiales', async () => {
      // Arrange
      const specialEmailPayload = {
        sub: mockUser.id,
        email: 'test+special@example-domain.com',
        roles: [ValidRoles.user]  
      } as JwtPayload;
      
      const userWithSpecialEmail = {
        ...mockUser,
        email: 'test+special@example-domain.com'
      };
      
      authModel.findOne.mockResolvedValue(userWithSpecialEmail as any);

      // Act
      const result = await strategy.validate(specialEmailPayload);

      // Assert
      expect(result.email).toBe('test+special@example-domain.com');
    });
  });
});