import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { AuthorsModule } from './authors.module';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { Author } from './models/author.model';

describe('AuthorsModule', () => {
  let module: TestingModule;
  let service: AuthorsService;
  let controller: AuthorsController;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AuthorsModule],
    })
      .overrideProvider(getModelToken(Author))
      .useValue({})
      .compile();

    service = module.get<AuthorsService>(AuthorsService);
    controller = module.get<AuthorsController>(AuthorsController);
  });

  it('debería estar definido el módulo', () => {
    expect(module).toBeDefined();
  });

  it('debería inyectar AuthorsService', () => {
    expect(service).toBeInstanceOf(AuthorsService);
  });

  it('debería inyectar AuthorsController', () => {
    expect(controller).toBeInstanceOf(AuthorsController);
  });

  it('debería poder obtener el token del modelo Author', () => {
    const authorToken = getModelToken(Author);
    const authorModel = module.get(authorToken);
    expect(authorModel).toBeDefined();
  });

  it('el servicio debería estar exportado por el módulo', async () => {
    const exportedService = module.get<AuthorsService>(AuthorsService);
    expect(exportedService).toBeDefined();
  });
});