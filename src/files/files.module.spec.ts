import { Test, TestingModule } from '@nestjs/testing';
import { FilesModule } from './files.module';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';

describe('FilesModule', () => {
  let module: TestingModule;
  let service: FilesService;
  let controller: FilesController;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [FilesModule],
    }).compile();

    service = module.get<FilesService>(FilesService);
    controller = module.get<FilesController>(FilesController);
  });

  it('debería estar definido el módulo', () => {
    expect(module).toBeDefined();
  });

  it('debería inyectar FilesService', () => {
    expect(service).toBeInstanceOf(FilesService);
  });

  it('debería inyectar FilesController', () => {
    expect(controller).toBeInstanceOf(FilesController);
  });

  it('el controlador debería tener el servicio definido', () => {
    // Validamos que el controlador puede usar el servicio
    expect((controller as any).filesService).toBeDefined();
  });
});
