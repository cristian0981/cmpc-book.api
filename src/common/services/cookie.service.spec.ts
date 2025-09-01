import { Test, TestingModule } from '@nestjs/testing';
import { CookiesService } from './cookie.service';
import { Request, Response } from 'express';

describe('CookiesService', () => {
  let service: CookiesService;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CookiesService],
    }).compile();

    service = module.get<CookiesService>(CookiesService);
    
    // Mock del objeto Response
    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
    
    // Mock del objeto Request
    mockRequest = {
      cookies: {},
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setCookies', () => {
    it('should set a cookie with correct options in development', () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const cookieName = 'test_cookie';
      const cookieValue = 'test_value';

      // Act
      service.setCookies(mockResponse as Response, cookieName, cookieValue);

      // Assert
      expect(mockResponse.cookie).toHaveBeenCalledWith(cookieName, cookieValue, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should set a cookie with secure flag in production', () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const cookieName = 'access_token';
      const cookieValue = 'jwt_token_value';

      // Act
      service.setCookies(mockResponse as Response, cookieName, cookieValue);

      // Assert
      expect(mockResponse.cookie).toHaveBeenCalledWith(cookieName, cookieValue, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should set multiple cookies correctly', () => {
      // Arrange
      const cookies = [
        { name: 'access_token', value: 'access_value' },
        { name: 'refresh_token', value: 'refresh_value' },
      ];

      // Act
      cookies.forEach(cookie => {
        service.setCookies(mockResponse as Response, cookie.name, cookie.value);
      });

      // Assert
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenNthCalledWith(1, 'access_token', 'access_value', expect.any(Object));
      expect(mockResponse.cookie).toHaveBeenNthCalledWith(2, 'refresh_token', 'refresh_value', expect.any(Object));
    });
  });

  describe('getCookies', () => {
    it('should return cookie value when cookie exists', () => {
      // Arrange
      const cookieName = 'access_token';
      const cookieValue = 'jwt_token_value';
      mockRequest.cookies = { [cookieName]: cookieValue };

      // Act
      const result = service.getCookies(mockRequest as Request, cookieName);

      // Assert
      expect(result).toBe(cookieValue);
    });

    it('should return undefined when cookie does not exist', () => {
      // Arrange
      const cookieName = 'non_existent_cookie';
      mockRequest.cookies = { access_token: 'some_value' };

      // Act
      const result = service.getCookies(mockRequest as Request, cookieName);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return undefined when req.cookies is undefined', () => {
      // Arrange
      const cookieName = 'access_token';
      mockRequest.cookies = undefined;

      // Act
      const result = service.getCookies(mockRequest as Request, cookieName);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return undefined when req.cookies is null', () => {
      // Arrange
      const cookieName = 'access_token';
      mockRequest.cookies = null as any;

      // Act
      const result = service.getCookies(mockRequest as Request, cookieName);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should handle empty cookies object', () => {
      // Arrange
      const cookieName = 'access_token';
      mockRequest.cookies = {};

      // Act
      const result = service.getCookies(mockRequest as Request, cookieName);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('clearCookies', () => {
    it('should clear access_token and refresh_token cookies', () => {
      // Act
      service.clearCookies(mockResponse as Response);

      // Assert
      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });

    it('should call clearCookie in correct order', () => {
      // Act
      service.clearCookies(mockResponse as Response);

      // Assert
      expect(mockResponse.clearCookie).toHaveBeenNthCalledWith(1, 'access_token');
      expect(mockResponse.clearCookie).toHaveBeenNthCalledWith(2, 'refresh_token');
    });
  });

  describe('Integration tests', () => {
    it('should work with real-like request and response objects', () => {
      // Arrange
      const realLikeRequest = {
        cookies: {
          access_token: 'real_jwt_token',
          refresh_token: 'real_refresh_token',
          other_cookie: 'other_value'
        }
      } as Request;

      const realLikeResponse = {
        cookie: jest.fn(),
        clearCookie: jest.fn()
      } as unknown as Response;

      // Act & Assert - getCookies
      expect(service.getCookies(realLikeRequest, 'access_token')).toBe('real_jwt_token');
      expect(service.getCookies(realLikeRequest, 'refresh_token')).toBe('real_refresh_token');
      expect(service.getCookies(realLikeRequest, 'non_existent')).toBeUndefined();

      // Act & Assert - setCookies
      service.setCookies(realLikeResponse, 'new_token', 'new_value');
      expect(realLikeResponse.cookie).toHaveBeenCalledWith('new_token', 'new_value', expect.any(Object));

      // Act & Assert - clearCookies
      service.clearCookies(realLikeResponse);
      expect(realLikeResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(realLikeResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
    });
  });
});