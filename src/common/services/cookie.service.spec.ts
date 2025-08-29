import { Test, TestingModule } from '@nestjs/testing';
import { CookiesService } from './cookie.service';
import { Response, Request } from 'express';

describe('CookiesService', () => {
  let service: CookiesService;
  let mockResponse: jest.Mocked<Response>;
  let mockRequest: jest.Mocked<Request>;

  beforeEach(async () => {
    // Mock del objeto Response de Express
    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as any;

    // Mock del objeto Request de Express
    mockRequest = {
      cookies: {},
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [CookiesService],
    }).compile();

    service = module.get<CookiesService>(CookiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('setCookies', () => {
    it('debería establecer una cookie con las opciones de seguridad correctas', () => {
      const nombreCookie = 'access_token';
      const valorCookie = 'jwt-token-value';

      service.setCookies(mockResponse, nombreCookie, valorCookie);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        nombreCookie,
        valorCookie,
        {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000,
        }
      );
      expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
    });

    it('debería establecer una cookie con valor string', () => {
      const nombreCookie = 'user_preference';
      const valorCookie = 'dark_mode';

      service.setCookies(mockResponse, nombreCookie, valorCookie);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        nombreCookie,
        valorCookie,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
        })
      );
    });

    it('debería establecer una cookie con valor numérico', () => {
      const nombreCookie = 'session_id';
      const valorCookie = '12345';

      service.setCookies(mockResponse, nombreCookie, valorCookie);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        nombreCookie,
        valorCookie,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
        })
      );
    });

    it('debería establecer una cookie con valor de objeto', () => {
      const nombreCookie = 'user_data';
      const valorCookie = '{ id: 1, name: "Test User" }';

      service.setCookies(mockResponse, nombreCookie, valorCookie);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        nombreCookie,
        valorCookie,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
        })
      );
    });

    it('debería establecer múltiples cookies correctamente', () => {
      service.setCookies(mockResponse, 'token1', 'value1');
      service.setCookies(mockResponse, 'token2', 'value2');

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenNthCalledWith(
        1,
        'token1',
        'value1',
        expect.objectContaining({ httpOnly: true })
      );
      expect(mockResponse.cookie).toHaveBeenNthCalledWith(
        2,
        'token2',
        'value2',
        expect.objectContaining({ httpOnly: true })
      );
    });

    it('debería manejar nombres de cookies con caracteres especiales', () => {
      const nombreCookie = 'access-token_v2';
      const valorCookie = 'special-value';

      service.setCookies(mockResponse, nombreCookie, valorCookie);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        nombreCookie,
        valorCookie,
        expect.objectContaining({ httpOnly: true })
      );
    });
  });

  describe('getCookies', () => {
    it('debería obtener el valor de una cookie existente', () => {
      const nombreCookie = 'access_token';
      const valorEsperado = 'jwt-token-value';
      mockRequest.cookies[nombreCookie] = valorEsperado;

      const resultado = service.getCookies(mockRequest, nombreCookie);

      expect(resultado).toBe(valorEsperado);
    });

    it('debería devolver undefined para una cookie inexistente', () => {
      const nombreCookie = 'cookie_inexistente';

      const resultado = service.getCookies(mockRequest, nombreCookie);

      expect(resultado).toBeUndefined();
    });

    it('debería obtener diferentes tipos de valores de cookies', () => {
      mockRequest.cookies = {
        'string_cookie': 'valor_string',
        'number_cookie': '123',
        'boolean_cookie': 'true',
      };

      expect(service.getCookies(mockRequest, 'string_cookie')).toBe('valor_string');
      expect(service.getCookies(mockRequest, 'number_cookie')).toBe('123');
      expect(service.getCookies(mockRequest, 'boolean_cookie')).toBe('true');
    });

    it('debería manejar cookies con valores vacíos', () => {
      mockRequest.cookies['empty_cookie'] = '';

      const resultado = service.getCookies(mockRequest, 'empty_cookie');

      expect(resultado).toBe('');
    });

    it('debería manejar cookies con valores null', () => {
      mockRequest.cookies['null_cookie'] = null;

      const resultado = service.getCookies(mockRequest, 'null_cookie');

      expect(resultado).toBeNull();
    });

    it('debería obtener cookies con nombres que contienen caracteres especiales', () => {
      const nombreCookie = 'refresh-token_v1';
      const valorCookie = 'refresh-jwt-value';
      mockRequest.cookies[nombreCookie] = valorCookie;

      const resultado = service.getCookies(mockRequest, nombreCookie);

      expect(resultado).toBe(valorCookie);
    });

    it('debería manejar múltiples cookies en el request', () => {
      mockRequest.cookies = {
        'access_token': 'access-value',
        'refresh_token': 'refresh-value',
        'session_id': 'session-value',
      };

      expect(service.getCookies(mockRequest, 'access_token')).toBe('access-value');
      expect(service.getCookies(mockRequest, 'refresh_token')).toBe('refresh-value');
      expect(service.getCookies(mockRequest, 'session_id')).toBe('session-value');
    });
  });

  describe('clearCookies', () => {
    it('debería limpiar las cookies access_token y refresh_token', () => {
      service.clearCookies(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
    });

    it('debería limpiar las cookies en el orden correcto', () => {
      service.clearCookies(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenNthCalledWith(1, 'access_token');
      expect(mockResponse.clearCookie).toHaveBeenNthCalledWith(2, 'refresh_token');
    });

    it('debería funcionar correctamente aunque las cookies no existan', () => {
      // clearCookie no debería fallar aunque las cookies no existan
      service.clearCookies(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });

    it('debería poder llamarse múltiples veces sin errores', () => {
      service.clearCookies(mockResponse);
      service.clearCookies(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(4);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('Integración entre métodos', () => {
    it('debería establecer y luego limpiar cookies correctamente', () => {
      // Establecer cookies
      service.setCookies(mockResponse, 'access_token', 'jwt-value');
      service.setCookies(mockResponse, 'refresh_token', 'refresh-value');

      // Verificar que se establecieron
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);

      // Limpiar cookies
      service.clearCookies(mockResponse);

      // Verificar que se limpiaron
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });

    it('debería manejar el flujo completo de autenticación con cookies', () => {
      // Simular establecimiento de tokens de autenticación
      const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      service.setCookies(mockResponse, 'access_token', accessToken);
      service.setCookies(mockResponse, 'refresh_token', refreshToken);

      // Verificar configuración de cookies de autenticación
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        accessToken,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
        })
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        refreshToken,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
        })
      );

      // Simular obtención de cookies del request
      mockRequest.cookies = {
        'access_token': accessToken,
        'refresh_token': refreshToken,
      };

      expect(service.getCookies(mockRequest, 'access_token')).toBe(accessToken);
      expect(service.getCookies(mockRequest, 'refresh_token')).toBe(refreshToken);

      // Simular logout - limpiar cookies
      service.clearCookies(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('Casos límite y manejo de errores', () => {
    it('debería manejar valores undefined en setCookies', () => {
      service.setCookies(mockResponse, 'test_cookie', undefined);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'test_cookie',
        undefined,
        expect.objectContaining({ httpOnly: true })
      );
    });

    it('debería manejar nombres de cookies vacíos', () => {
      service.setCookies(mockResponse, '', 'value');

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        '',
        'value',
        expect.objectContaining({ httpOnly: true })
      );
    });

    it('debería manejar request sin objeto cookies', () => {
      const mockReq = {} as Request; // Sin cookies
      const mockRes = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      } as unknown as Response;
    
      const result = service.getCookies(mockReq, 'any_cookie');
      expect(result).toBeUndefined();
    });
    
    it('debería manejar request con cookies como null', () => {
      const mockReq = {
        cookies: null
      } as unknown as Request;
      const mockRes = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      } as unknown as Response;
    
      const result = service.getCookies(mockReq, 'any_cookie');
      expect(result).toBeUndefined();
    });
  });
});