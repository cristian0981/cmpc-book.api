import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { ValidRoles } from '../auth/interfaces';
import { CreateBookDto } from './dto/create-book.dto';
import { Auth } from '../auth/models/auth.model';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FilterBooksDto } from './dto/filter-books.dto';
import { any } from 'joi';
import { UpdateBookDto } from './dto/update-book.dto';

describe('BooksController', () => {
  let controller: BooksController;
  let service: jest.Mocked<BooksService>;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Cristian',
    email: 'cristian@example.com',
    password: '123456',
    roles: [ValidRoles.user],
  };

  const mockBook = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Book 1',
    publishedAt: null,
    price: 10,
    stock: 100,
    authorId: '550e8400-e29b-41d4-a716-446655440000',
    genreId: '550e8400-e29b-41d4-a716-446655440000',
    editorialId: '550e8400-e29b-41d4-a716-446655440000',
    imageUrl: 'image.jpg',
    availability: false,
    updatedBy: '',
    deletedBy: '',
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            exportToCsv: jest.fn(),
            getAvailableBooks: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            updateStock: jest.fn(),
            sellBook: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get(BooksService);
  });

  it('comprobar si existe el controlador BooksController', () => {
    expect(controller).toBeDefined();
  });
  it('comprobar si existe el servicio BooksService', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un libro válido y devolverlo (201)', async () => {
      const dto: CreateBookDto = {
        title: mockBook.title,
        authorId: mockBook.authorId,
        editorialId: mockBook.editorialId,
        availability: mockBook.availability,
        genreId: mockBook.genreId,
        price: 25.99,
        stock: 10,
        publishedAt: '2024-01-15' as any,
        imageUrl: mockBook.imageUrl,
      };

      service.create.mockResolvedValueOnce(mockBook as any);

      const result = await controller.create(
        dto as CreateBookDto,
        mockUser as Auth,
      );
      expect(service.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(mockBook);
    });

      it('debe propagar BadRequest si los FKs no existen', async () => {
      const dto = {
        title: 'X',
        authorId: 'non-existing',
        editorialId: mockBook.editorialId,
        genreId: mockBook.genreId,
        price: 10,
        stock: 1,
        publishedAt: '2024-01-01',
      } as any;

      service.create.mockRejectedValueOnce(new BadRequestException('El autor no existe'));
      await expect(controller.create(dto, mockUser as Auth)).rejects.toThrow(BadRequestException);
    });

    

  });

  // Actualizar el mockBooksList (líneas 113-116):
  const mockBooksList = {
    data: [mockBook],
    pagination: { total: 1, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
  };
  
  describe('findAll', () => {
    it('debe devolver lista paginada con meta', async () => {
      const query: FilterBooksDto = { page: 1, limit: 10 } as any;
      service.findAll.mockResolvedValueOnce(mockBooksList as any);
  
      const result = await controller.findAll(query);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result.data).toEqual(mockBooksList.data);
      expect(result.pagination).toEqual(mockBooksList.pagination);
      expect(result).toEqual(mockBooksList);
    });
  
    it('debe aplicar filtros/orden/búsqueda correctamente (pasa los query al service)', async () => {
      const query = {
        page: 2,
        limit: 5,
        search: 'quijote',
        genreId: mockBook.genreId,
        authorId: mockBook.authorId,
        editorialId: mockBook.editorialId,
        availability: true,
        sortBy: 'title,price',
        order: 'asc,desc',
      } as any;
  
      service.findAll.mockResolvedValueOnce(mockBooksList as any);
  
      const result = await controller.findAll(query);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result.data).toEqual(mockBooksList.data);
      expect(result.pagination).toEqual(mockBooksList.pagination);
    });
  });


  describe('exportToCsv', () => {
    it('debe retornar CSV y setear cabeceras', async () => {
      const csv = 'id,title\n1,Libro';
      service.exportToCsv.mockResolvedValueOnce(csv);

      const headers: Record<string, string> = {};
      const res = {
        header: jest.fn((k: string, v: string) => {
          headers[k] = v;
          return res;
        }),
        send: jest.fn(),
      } as unknown as Response;

      const query: FilterBooksDto = { page: 1, limit: 10 } as any;
      await controller.exportToCsv(res as any, query);

      expect(service.exportToCsv).toHaveBeenCalledWith(query);
      expect(headers['Content-Type']).toBe('text/csv');
      expect(headers['Content-Disposition']).toBe('attachment; filename=books.csv');
      expect((res as any).send).toHaveBeenCalledWith(csv);
    });
  });

    describe('getAvailableBooks', () => {
    it('debe devolver solo libros con stock > 0', async () => {
      service.getAvailableBooks.mockResolvedValueOnce([mockBook] as any);
      const result = await controller.getAvailableBooks();
      expect(service.getAvailableBooks).toHaveBeenCalled();
      expect(result).toEqual([mockBook]);
    });
  });

  describe('findOne', () => {
    it('debe devolver un libro válido', async () => {
      service.findOne.mockResolvedValueOnce(mockBook as any);
      const result = await controller.findOne(mockBook.id);
      expect(service.findOne).toHaveBeenCalledWith(mockBook.id);
      expect(result).toEqual(mockBook);
    });

    it('debe lanzar NotFound si no existe', async () => {
      service.findOne.mockRejectedValueOnce(new NotFoundException('Libro no encontrado'));
      await expect(controller.findOne('33333333-3333-3333-3333-333333333333')).rejects.toThrow(NotFoundException);
    });
  });

    describe('update', () => {
    it('debe actualizar campos válidos y devolver el libro', async () => {
      const dto: UpdateBookDto = { title: 'Nuevo título', price: 30 } as any;
      const updated = { ...mockBook, ...dto };
      service.update.mockResolvedValueOnce(updated as any);

      const result = await controller.update(mockBook.id, dto as any, mockUser as Auth);
      expect(service.update).toHaveBeenCalledWith(mockBook.id, dto, mockUser);
      expect(result).toEqual(updated);
    });

    it('debe lanzar NotFound si el libro no existe', async () => {
      service.update.mockRejectedValueOnce(new NotFoundException('Libro no encontrado'));
      await expect(controller.update('33333333-3333-3333-3333-333333333333', { title: 'X' } as any, mockUser as Auth))
        .rejects.toThrow(NotFoundException);
    });
  });


    describe('updateStock', () => {
    it('debe actualizar el stock correctamente', async () => {
      const updated = { ...mockBook, stock: 25 };
      service.updateStock.mockResolvedValueOnce(updated as any);

      const result = await controller.updateStock(mockBook.id, 25, mockUser as Auth);
      expect(service.updateStock).toHaveBeenCalledWith(mockBook.id, 25);
      expect(result).toEqual(updated);
    });

    it('debe fallar con BadRequest si el stock es negativo', async () => {
      service.updateStock.mockRejectedValueOnce(new BadRequestException('Stock inválido'));
      await expect(controller.updateStock(mockBook.id, -1, mockUser as Auth)).rejects.toThrow(BadRequestException);
    });
  });

   describe('sellBook', () => {
    it('debe descontar stock y devolver payload de venta', async () => {
      const payload = {
        message: 'Venta procesada exitosamente',
        book: { ...mockBook, stock: 8 },
        soldQuantity: 2,
        remainingStock: 8,
      };
      service.sellBook.mockResolvedValueOnce(payload as any);

      const result = await controller.sellBook(mockBook.id, 2, mockUser as Auth);
      expect(service.sellBook).toHaveBeenCalledWith(mockBook.id, 2, mockUser.id);
      expect(result).toEqual(payload);
    });

    it('debe fallar con BadRequest si la cantidad excede el stock', async () => {
      service.sellBook.mockRejectedValueOnce(new BadRequestException('Stock insuficiente'));
      await expect(controller.sellBook(mockBook.id, 999, mockUser as Auth)).rejects.toThrow(BadRequestException);
    });
  });

    describe('remove', () => {
    it('debe eliminar (soft delete) y devolver undefined (204)', async () => {
      service.remove.mockResolvedValueOnce(undefined);
      const result = await controller.remove(mockBook.id, mockUser as Auth);
      expect(service.remove).toHaveBeenCalledWith(mockBook.id, mockUser as Auth);
      expect(result).toBeUndefined();
    });

    it('debe lanzar NotFound si el libro no existe', async () => {
      service.remove.mockRejectedValueOnce(new NotFoundException('Libro no encontrado'));
      await expect(controller.remove('33333333-3333-3333-3333-333333333333', mockUser as Auth)).rejects.toThrow(NotFoundException);
    });
  });


});
