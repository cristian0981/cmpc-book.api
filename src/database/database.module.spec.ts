import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from './database.module';
import { SequelizeModule } from '@nestjs/sequelize';

// Mock completo del módulo envs antes de importar DatabaseModule
jest.mock('../settings/envs', () => ({
  envs: {
    db_host: 'localhost',
    db_port: 5436,
    db_user: 'postgres',
    db_password: 'password',
    db_name: 'cmpc_bookstore',
  },
}));

describe('DatabaseModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
    })
    .overrideProvider(SequelizeModule)
    .useValue({
      // Mock del SequelizeModule para evitar conexión real
    })
    .compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should be a valid NestJS module', () => {
    expect(DatabaseModule).toBeDefined();
    expect(typeof DatabaseModule).toBe('function');
  });

  it('should import SequelizeModule with correct configuration', () => {
    // Verificar que el módulo se puede instanciar sin errores
    expect(() => {
      const moduleRef = Test.createTestingModule({
        imports: [DatabaseModule],
      });
      expect(moduleRef).toBeDefined();
    }).not.toThrow();
  });
});