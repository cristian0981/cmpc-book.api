import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { BooksService } from './books.service';
import { Book } from './models/book.model';
import { Author } from '../authors/models/author.model';
import { Editorial } from '../editorials/models/editorial.model';
import { Genre } from '../genres/models/genre.model';
import { Auth } from '../auth/models/auth.model';
import { FilesService } from '../files/files.service';

describe('BooksService', () => {
  let service: BooksService;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
  } as Auth;

  const mockBook = {
    id: 'book-uuid',
    title: 'El Quijote',
    isbn: '978-84-376-0494-7',
    price: 25.99,
    stock: 10,
    availability: true,
    authorId: 'author-uuid',
    editorialId: 'editorial-uuid',
    genreId: 'genre-uuid',
    createdBy: 'user-uuid',
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockBookModel = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockAuthorModel = {
    findByPk: jest.fn(),
  };

  const mockEditorialModel = {
    findByPk: jest.fn(),
  };

  const mockGenreModel = {
    findByPk: jest.fn(),
  };

  const mockFilesService = {
    upload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getModelToken(Book),
          useValue: mockBookModel,
        },
        {
          provide: getModelToken(Author),
          useValue: mockAuthorModel,
        },
        {
          provide: getModelToken(Editorial),
          useValue: mockEditorialModel,
        },
        {
          provide: getModelToken(Genre),
          useValue: mockGenreModel,
        },
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear un libro si no existe y las relaciones son válidas', async () => {
      mockBookModel.findOne.mockResolvedValue(null);
      mockAuthorModel.findByPk.mockResolvedValue({ id: 'author-uuid' });
      mockEditorialModel.findByPk.mockResolvedValue({ id: 'editorial-uuid' });
      mockGenreModel.findByPk.mockResolvedValue({ id: 'genre-uuid' });
      mockBookModel.create.mockResolvedValue(mockBook);

      const result = await service.create(
        { title: 'Nuevo libro', authorId: 'author-uuid', editorialId: 'editorial-uuid', genreId: 'genre-uuid' } as any,
        mockUser,
      );

      expect(result).toEqual(mockBook);
      expect(mockBookModel.create).toHaveBeenCalledWith(expect.objectContaining({ createdBy: mockUser.id }));
    });

    it('debe lanzar ConflictException si el título ya existe', async () => {
      mockBookModel.findOne.mockResolvedValue(mockBook);
      await expect(
        service.create({ title: 'El Quijote' } as any, mockUser),
      ).rejects.toThrow(ConflictException);
    });

    it('debe lanzar NotFoundException si no existe autor', async () => {
      mockBookModel.findOne.mockResolvedValue(null);
      mockAuthorModel.findByPk.mockResolvedValue(null);
      
      await expect(
        service.create({ title: 'Nuevo libro', authorId: 'invalid-author' } as any, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar NotFoundException si no existe editorial', async () => {
      mockBookModel.findOne.mockResolvedValue(null);
      mockAuthorModel.findByPk.mockResolvedValue({ id: 'author-uuid' });
      mockEditorialModel.findByPk.mockResolvedValue(null);
      
      await expect(
        service.create({ title: 'Nuevo libro', authorId: 'author-uuid', editorialId: 'invalid-editorial' } as any, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar NotFoundException si no existe género', async () => {
      mockBookModel.findOne.mockResolvedValue(null);
      mockAuthorModel.findByPk.mockResolvedValue({ id: 'author-uuid' });
      mockEditorialModel.findByPk.mockResolvedValue({ id: 'editorial-uuid' });
      mockGenreModel.findByPk.mockResolvedValue(null);
      
      await expect(
        service.create({ title: 'Nuevo libro', authorId: 'author-uuid', editorialId: 'editorial-uuid', genreId: 'invalid-genre' } as any, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    const mockPaginatedResult = {
      rows: [mockBook],
      count: 1,
    };

    it('debe devolver lista paginada de libros', async () => {
      mockBookModel.findAndCountAll.mockResolvedValue(mockPaginatedResult);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([mockBook]);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('debe aplicar filtros correctamente', async () => {
      mockBookModel.findAndCountAll.mockResolvedValue(mockPaginatedResult);

      await service.findAll({ 
        page: 1, 
        limit: 10, 
        search: 'Quijote',
        authorId: 'author-uuid',
        genreId: 'genre-uuid'
      });

      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            authorId: 'author-uuid',
            genreId: 'genre-uuid'
          })
        })
      );
    });
  });

  describe('findOne', () => {
    it('debe devolver un libro por ID', async () => {
      mockBookModel.findByPk.mockResolvedValue(mockBook);

      const result = await service.findOne('book-uuid');

      expect(result).toEqual(mockBook);
      expect(mockBookModel.findByPk).toHaveBeenCalledWith('book-uuid', expect.any(Object));
    });

    it('debe lanzar NotFoundException si no encuentra el libro', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar un libro existente', async () => {
      const updatedBook = { ...mockBook, title: 'Título actualizado' };
      mockBookModel.findByPk.mockResolvedValue(mockBook);
      mockAuthorModel.findByPk.mockResolvedValue({ id: 'author-uuid' });
      mockEditorialModel.findByPk.mockResolvedValue({ id: 'editorial-uuid' });
      mockGenreModel.findByPk.mockResolvedValue({ id: 'genre-uuid' });
      mockBook.update.mockResolvedValue(updatedBook);
      // Mock para findOne que se llama al final del método update
      mockBookModel.findByPk.mockResolvedValueOnce(updatedBook);

      const result = await service.update('book-uuid', { title: 'Título actualizado' } as any, mockUser);

      expect(mockBook.update).toHaveBeenCalledWith(expect.objectContaining({ 
        title: 'Título actualizado',
        updatedBy: mockUser.id 
      }));
    });

    it('debe lanzar NotFoundException si no encuentra el libro', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { title: 'Nuevo título' } as any, mockUser)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar un libro existente', async () => {
      mockBookModel.findByPk.mockResolvedValue(mockBook);
      mockBook.update.mockResolvedValue(mockBook);
      mockBook.destroy.mockResolvedValue(undefined);

      await service.remove('book-uuid', mockUser);

      expect(mockBook.update).toHaveBeenCalledWith({ deletedBy: mockUser.id });
      expect(mockBook.destroy).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si no encuentra el libro', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(service.remove('invalid-id', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('sellBook', () => {
    it('debe vender un libro con stock suficiente', async () => {
      const bookWithStock = { 
        ...mockBook, 
        stock: 5, 
        availability: true,
        update: jest.fn().mockResolvedValue(undefined)
      };
      const updatedBook = { ...bookWithStock, stock: 3 };
      
      mockBookModel.findByPk.mockResolvedValueOnce(bookWithStock);
      // Mock para findOne que se llama al final del método sellBook
      mockBookModel.findByPk.mockResolvedValueOnce(updatedBook);

      const result = await service.sellBook('book-uuid', 2, 'user-uuid');

      expect(result.message).toBe('Venta procesada exitosamente');
      expect(result.soldQuantity).toBe(2);
      expect(result.remainingStock).toBe(3);
      expect(result.book).toEqual(updatedBook); // Verificar que el libro devuelto es el actualizado
      expect(bookWithStock.update).toHaveBeenCalledWith({
        stock: 3,
        updatedBy: 'user-uuid'
      });
    });

    it('debe lanzar BadRequestException si el libro no está disponible', async () => {
      const unavailableBook = { 
        ...mockBook, 
        stock: 5, 
        availability: false
      };
      mockBookModel.findByPk.mockResolvedValue(unavailableBook);

      await expect(
        service.sellBook('book-uuid', 2, 'user-uuid')
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si no hay stock suficiente', async () => {
      const bookWithLowStock = { 
        ...mockBook, 
        stock: 1, 
        availability: true
      };
      mockBookModel.findByPk.mockResolvedValue(bookWithLowStock);

      await expect(
        service.sellBook('book-uuid', 5, 'user-uuid')
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar NotFoundException si no encuentra el libro', async () => {
      mockBookModel.findByPk.mockResolvedValue(null);

      await expect(
        service.sellBook('invalid-id', 1, 'user-uuid')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
