import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { EditorialsModule } from './editorials.module';
import { EditorialsService } from './editorials.service';
import { EditorialsController } from './editorials.controller';
import { Editorial } from './models/editorial.model';

describe('EditorialsModule', () => {
  let module: TestingModule;
  let service: EditorialsService;
  let controller: EditorialsController;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [EditorialsModule],
    })
      .overrideProvider(getModelToken(Editorial))
      .useValue({})
      .compile();

    service = module.get<EditorialsService>(EditorialsService);
    controller = module.get<EditorialsController>(EditorialsController);
  });

  it('debería estar definido el módulo', () => {
    expect(module).toBeDefined();
  });

  it('debería inyectar EditorialsService', () => {
    expect(service).toBeInstanceOf(EditorialsService);
  });

  it('debería inyectar EditorialsController', () => {
    expect(controller).toBeInstanceOf(EditorialsController);
  });

  it('debería poder obtener el token del modelo Editorial', () => {
    const editorialToken = getModelToken(Editorial);
    const editorialModel = module.get(editorialToken);
    expect(editorialModel).toBeDefined();
  });

  it('el servicio debería estar exportado por el módulo', async () => {
    const exportedService = module.get<EditorialsService>(EditorialsService);
    expect(exportedService).toBeDefined();
  });
});
