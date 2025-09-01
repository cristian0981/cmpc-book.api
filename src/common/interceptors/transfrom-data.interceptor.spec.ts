import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptorRequest, Response } from './transfrom-data.interceptor';

describe('TransformInterceptorRequest', () => {
  let interceptor: TransformInterceptorRequest<any>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;
  let mockResponse: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformInterceptorRequest],
    }).compile();

    interceptor = module.get<TransformInterceptorRequest<any>>(TransformInterceptorRequest);

    // Mock del response HTTP
    mockResponse = {
      statusCode: 200,
    };

    // Mock del ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as any;

    // Mock del CallHandler
    mockCallHandler = {
      handle: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('debe transformar respuesta con objeto simple', (done) => {
      const testData = { id: 1, name: 'Test' };
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe((transformedData: Response<any>) => {
        expect(transformedData).toEqual({
          statusCode: 200,
          data: testData,
        });
        done();
      });
    });

    it('debe transformar respuesta con array', (done) => {
      const testData = [{ id: 1, name: 'Test1' }, { id: 2, name: 'Test2' }];
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe((transformedData: Response<any>) => {
        expect(transformedData).toEqual({
          statusCode: 200,
          data: testData,
        });
        done();
      });
    });

    it('debe usar statusCode 200 por defecto cuando no está definido', (done) => {
      mockResponse.statusCode = undefined;
      const testData = { message: 'success' };
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe((transformedData: Response<any>) => {
        expect(transformedData.statusCode).toBe(200);
        expect(transformedData.data).toEqual(testData);
        done();
      });
    });

    it('debe preservar statusCode personalizado', (done) => {
      mockResponse.statusCode = 201;
      const testData = { id: 1, created: true };
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe((transformedData: Response<any>) => {
        expect(transformedData.statusCode).toBe(201);
        expect(transformedData.data).toEqual(testData);
        done();
      });
    });

    it('debe manejar respuesta con datos null', (done) => {
      const testData = null;
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe((transformedData: Response<any>) => {
        expect(transformedData).toEqual({
          statusCode: 200,
          data: null,
        });
        done();
      });
    });

    it('debe manejar respuesta con datos undefined', (done) => {
      const testData = undefined;
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe((transformedData: Response<any>) => {
        expect(transformedData).toEqual({
          statusCode: 200,
          data: undefined,
        });
        done();
      });
    });

    it('debe manejar respuesta con string', (done) => {
      const testData = 'success message';
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe((transformedData: Response<any>) => {
        expect(transformedData).toEqual({
          statusCode: 200,
          data: 'success message',
        });
        done();
      });
    });

    it('debe manejar respuesta con número', (done) => {
      const testData = 42;
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe((transformedData: Response<any>) => {
        expect(transformedData).toEqual({
          statusCode: 200,
          data: 42,
        });
        done();
      });
    });

    it('debe manejar respuesta con boolean', (done) => {
      const testData = true;
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe((transformedData: Response<any>) => {
        expect(transformedData).toEqual({
          statusCode: 200,
          data: true,
        });
        done();
      });
    });

    it('debe manejar diferentes códigos de estado HTTP', (done) => {
      mockResponse.statusCode = 404;
      const testData = { error: 'Not found' };
      mockCallHandler.handle.mockReturnValue(of(testData));

      const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

      result.subscribe((transformedData: Response<any>) => {
        expect(transformedData.statusCode).toBe(404);
        expect(transformedData.data).toEqual(testData);
        done();
      });
    });
  });
});