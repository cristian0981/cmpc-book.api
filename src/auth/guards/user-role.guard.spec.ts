import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRoleGuard } from './user-role.guard';
import { ValidRoles } from '../interfaces';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { Auth } from '../models/auth.model';

describe('UserRoleGuard', () => {
  let guard: UserRoleGuard;
  let reflector: jest.Mocked<Reflector>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockRequest: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRoleGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<UserRoleGuard>(UserRoleGuard);
    reflector = module.get(Reflector);

    // Mock del request
    mockRequest = {
      user: null,
    };

    // Mock del ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getHandler: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('debe permitir acceso cuando no hay roles definidos', () => {
      reflector.get.mockReturnValue(null);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(META_ROLES, mockExecutionContext.getHandler());
    });

    it('debe permitir acceso cuando el array de roles está vacío', () => {
      reflector.get.mockReturnValue([]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('debe lanzar BadRequestException cuando no hay usuario', () => {
      reflector.get.mockReturnValue([ValidRoles.admin]);
      mockRequest.user = null;

      expect(() => guard.canActivate(mockExecutionContext))
        .toThrow(BadRequestException);
      expect(() => guard.canActivate(mockExecutionContext))
        .toThrow('User not found');
    });

    it('debe permitir acceso cuando el usuario tiene el rol requerido', () => {
      const mockUser: Partial<Auth> = {
        id: 'user-id',
        name: 'Test User',
        roles: [ValidRoles.admin],
      };
      
      reflector.get.mockReturnValue([ValidRoles.admin]);
      mockRequest.user = mockUser;

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('debe permitir acceso cuando el usuario tiene uno de los roles requeridos', () => {
      const mockUser: Partial<Auth> = {
        id: 'user-id',
        name: 'Test User',
        roles: [ValidRoles.user, ValidRoles.admin],
      };
      
      reflector.get.mockReturnValue([ValidRoles.admin, ValidRoles.superUser]);
      mockRequest.user = mockUser;

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('debe lanzar ForbiddenException cuando el usuario no tiene el rol requerido', () => {
      const mockUser: Partial<Auth> = {
        id: 'user-id',
        name: 'Test User',
        roles: [ValidRoles.user],
      };
      
      reflector.get.mockReturnValue([ValidRoles.admin]);
      mockRequest.user = mockUser;

      expect(() => guard.canActivate(mockExecutionContext))
        .toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockExecutionContext))
        .toThrow('El usuario Test User no tiene permisos para acceder a este recurso');
    });

    it('debe lanzar ForbiddenException cuando el usuario no tiene ninguno de los roles requeridos', () => {
      const mockUser: Partial<Auth> = {
        id: 'user-id',
        name: 'Usuario Sin Permisos',
        roles: [ValidRoles.user],
      };
      
      reflector.get.mockReturnValue([ValidRoles.admin, ValidRoles.superUser]);
      mockRequest.user = mockUser;

      expect(() => guard.canActivate(mockExecutionContext))
        .toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockExecutionContext))
        .toThrow('El usuario Usuario Sin Permisos no tiene permisos para acceder a este recurso');
    });

    it('debe manejar usuario con roles vacíos', () => {
      const mockUser: Partial<Auth> = {
        id: 'user-id',
        name: 'Usuario Sin Roles',
        roles: [],
      };
      
      reflector.get.mockReturnValue([ValidRoles.admin]);
      mockRequest.user = mockUser;

      expect(() => guard.canActivate(mockExecutionContext))
        .toThrow(ForbiddenException);
    });

    it('debe manejar usuario sin propiedad roles', () => {
      const mockUser: Partial<Auth> = {
        id: 'user-id',
        name: 'Usuario Sin Roles',
        // roles: undefined
      };
      
      reflector.get.mockReturnValue([ValidRoles.admin]);
      mockRequest.user = mockUser;

      expect(() => guard.canActivate(mockExecutionContext))
        .toThrow(TypeError);
      expect(() => guard.canActivate(mockExecutionContext))
        .toThrow('user.roles is not iterable');
    });

    it('debe verificar múltiples roles correctamente', () => {
      const mockUser: Partial<Auth> = {
        id: 'user-id',
        name: 'Super Admin',
        roles: [ValidRoles.user, ValidRoles.admin, ValidRoles.superUser],
      };
      
      reflector.get.mockReturnValue([ValidRoles.superUser]);
      mockRequest.user = mockUser;

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });
  });
});