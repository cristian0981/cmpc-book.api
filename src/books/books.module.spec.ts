import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { BooksModule } from './books.module';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book } from './models/book.model';
import { Author } from '../authors/models/author.model';
import { Editorial } from '../editorials/models/editorial.model';
import { Genre } from '../genres/models/genre.model';
import { Auth } from '../auth/models/auth.model';
import { FilesService } from '../files/files.service';
import { AuthorsModule } from '../authors/authors.module';
import { EditorialsModule } from '../editorials/editorials.module';
import { GenresModule } from '../genres/genres.module';
import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../files/files.module';

describe('BooksModule', () => {
  let module: TestingModule;
  let service: BooksService;
  let controller: BooksController;
  let filesService: FilesService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        BooksModule,
        AuthorsModule,
        EditorialsModule,
        GenresModule,
        AuthModule,
        FilesModule
      ],
    })
      .overrideProvider(getModelToken(Book))
      .useValue({})
      .overrideProvider(getModelToken(Author))
      .useValue({})
      .overrideProvider(getModelToken(Editorial))
      .useValue({})
      .overrideProvider(getModelToken(Genre))
      .useValue({})
      .overrideProvider(getModelToken(Auth))
      .useValue({})
      .compile();

    service = module.get<BooksService>(BooksService);
    controller = module.get<BooksController>(BooksController);
    filesService = module.get<FilesService>(FilesService);
  });

  it('debería estar definido el módulo', () => {
    expect(module).toBeDefined();
  });

  it('debería inyectar BooksService', () => {
    expect(service).toBeInstanceOf(BooksService);
  });

  it('debería inyectar BooksController', () => {
    expect(controller).toBeInstanceOf(BooksController);
  });

  it('debería inyectar FilesService', () => {
    expect(filesService).toBeInstanceOf(FilesService);
  });

  it('debería poder obtener el token del modelo Book', () => {
    const bookToken = getModelToken(Book);
    const bookModel = module.get(bookToken);
    expect(bookModel).toBeDefined();
  });

  it('debería poder obtener el token del modelo Author', () => {
    const authorToken = getModelToken(Author);
    const authorModel = module.get(authorToken);
    expect(authorModel).toBeDefined();
  });

  it('debería poder obtener el token del modelo Editorial', () => {
    const editorialToken = getModelToken(Editorial);
    const editorialModel = module.get(editorialToken);
    expect(editorialModel).toBeDefined();
  });

  it('debería poder obtener el token del modelo Genre', () => {
    const genreToken = getModelToken(Genre);
    const genreModel = module.get(genreToken);
    expect(genreModel).toBeDefined();
  });

  it('debería poder obtener el token del modelo Auth', () => {
    const authToken = getModelToken(Auth);
    const authModel = module.get(authToken);
    expect(authModel).toBeDefined();
  });

  it('el servicio debería estar exportado por el módulo', async () => {
    const exportedService = module.get<BooksService>(BooksService);
    expect(exportedService).toBeDefined();
  });
});