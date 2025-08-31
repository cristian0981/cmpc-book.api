import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBooksDto } from './dto/filter-books.dto';
import { Book } from './models/book.model';
import { Author } from '../authors/models/author.model';
import { Editorial } from '../editorials/models/editorial.model';
import { Genre } from '../genres/models/genre.model';
import { Auth } from '../auth/models/auth.model';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { FilesService } from '../files/files.service';


@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book)
    private readonly bookModel: typeof Book,
    @InjectModel(Author)
    private readonly authorModel: typeof Author,
    @InjectModel(Editorial)
    private readonly editorialModel: typeof Editorial,
    @InjectModel(Genre)
    private readonly genreModel: typeof Genre,
    private readonly filesService: FilesService,  
  ) {}

  async create(createBookDto: CreateBookDto,  user: Auth): Promise<Book> {
    const existingBook = await this.bookModel.findOne({
      where: { title: createBookDto.title },
    });

    if (existingBook) {
      throw new ConflictException('Ya existe un libro con ese título');
    }


    // Verificar que existan las relaciones
    await this.validateRelations(createBookDto);

    return await this.bookModel.create({
      ...createBookDto,
      createdBy: user.id,
    },
  );
  }

  async findAll(filterDto: FilterBooksDto): Promise<PaginatedResponse<Book>> {
    const {
      page = 1,
      limit = 10,
      genreId,
      editorialId,
      authorId,
      availability,
      search,
      sortBy = 'createdAt',
      order = 'DESC',
    } = filterDto;
  
    const offset = (page - 1) * limit;
    const whereClause: any = {};
  
    // Filtros
    if (genreId) whereClause.genreId = genreId;
    if (editorialId) whereClause.editorialId = editorialId;
    if (authorId) whereClause.authorId = authorId;
    if (availability !== undefined) {
      whereClause.stock = availability ? { [Op.gt]: 0 } : 0;
    }
  
    // Búsqueda en tiempo real
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
      ];
    }
  
    const { count, rows } = await this.bookModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Author,
          attributes: ['id', 'name'],
        },
        {
          model: Editorial,
          attributes: ['id', 'name'],
        },
        {
          model: Genre,
          attributes: ['id', 'name'],
        },
        {
          model: Auth,
          as: 'creator',
          attributes: ['id', 'email'],
          required: false,
        },
        {
          model: Auth,
          as: 'updater',
          attributes: ['id', 'email'],
          required: false,
        },
        {
          model: Auth,
          as: 'deleter',
          attributes: ['id', 'email'],
          required: false,
        },
      ],
      order: [[sortBy, order]],
      limit,
      offset,
      distinct: true,
    });
  
    const totalPages = Math.ceil(count / limit);
  
    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel.findByPk(id, {
      include: [
        {
          model: Author,
          attributes: ['id', 'name'],
        },
        {
          model: Editorial,
          attributes: ['id', 'name'],
        },
        {
          model: Genre,
          attributes: ['id', 'name'],
        },
        {
          model: Auth,
          as: 'deleter',
          attributes: ['id', 'email'],
          required: false,
        },
      ],
    });

    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }

    return book;
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
    user: Auth,
  ): Promise<Book> {
    const book = await this.bookModel.findByPk(id);
    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }


    // Verificar relaciones si se están actualizando
    if (
      updateBookDto.authorId ||
      updateBookDto.editorialId ||
      updateBookDto.genreId
    ) {
      await this.validateRelations(updateBookDto);
    }

    const updateData = { ...updateBookDto, updatedBy: user.id };


    await book.update(updateData);
    return await this.findOne(id);
  }

  async remove(id: string, user: Auth): Promise<void> {
    const book = await this.bookModel.findByPk(id);
    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }

    // Soft delete con información de quién eliminó
    await book.update({ deletedBy: user.id });
    await book.destroy();
  }

  async exportToCsv(filterDto: FilterBooksDto): Promise<string> {
    const {
      page = 1,
      limit = 1000, // Límite más alto para CSV, pero aún controlado
      genreId,
      editorialId,
      authorId,
      availability,
      search,
      sortBy = 'title',
      order = 'ASC',
    } = filterDto;
  
    const offset = (page - 1) * limit;
    const whereClause: any = {};
  
    // Aplicar los mismos filtros que findAll
    if (genreId) whereClause.genreId = genreId;
    if (editorialId) whereClause.editorialId = editorialId;
    if (authorId) whereClause.authorId = authorId;
    if (availability !== undefined) {
      whereClause.stock = availability ? { [Op.gt]: 0 } : 0;
    }
  
    // Búsqueda en tiempo real
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
      ];
    }
  
    const books = await this.bookModel.findAll({
      where: whereClause,
      include: [
        {
          model: Author,
          attributes: ['name'],
        },
        {
          model: Editorial,
          attributes: ['name'],
        },
        {
          model: Genre,
          attributes: ['name'],
        },
      ],
      order: [[sortBy, order]],
      limit,
      offset,
    });
  
    // Crear CSV
    const headers = [
      'ID',
      'Título',
      'Fecha de Publicación',
      'Precio',
      'Stock',
      'Autor',
      'Editorial',
      'Género',
      'Fecha de Creación',
    ];
  
    const csvRows = [headers.join(',')];
  
    books.forEach((book) => {
      const row = [
        book.id,
        `"${book.title.replace(/"/g, '""')}"`, // Escapar comillas
        book.publishedAt,
        book.price,
        book.stock,
        `"${book.author?.name || ''}"`,
        `"${book.editorial?.name || ''}"`,
        `"${book.genre?.name || ''}"`,
        book.createdAt.toISOString().split('T')[0],
      ];
      csvRows.push(row.join(','));
    });
  
    return csvRows.join('\n');
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    return await this.bookModel.findOne({
      where: { isbn },
    });
  }

  async updateStock(id: string, quantity: number): Promise<Book> {
    const book = await this.bookModel.findByPk(id);
    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }

    const newStock = book.stock + quantity;
    if (newStock < 0) {
      throw new BadRequestException('Stock insuficiente');
    }

    await book.update({ stock: newStock });
    return book;
  }

  async getAvailableBooks(): Promise<Book[]> {
    return await this.bookModel.findAll({
      where: {
        stock: { [Op.gt]: 0 },
      },
      include: [
        {
          model: Author,
          attributes: ['id', 'name'],
        },
        {
          model: Editorial,
          attributes: ['id', 'name'],
        },
        {
          model: Genre,
          attributes: ['id', 'name'],
        },
      ],
      order: [['title', 'ASC']],
    });
  }

 async sellBook(id: string, quantity: number, userId: string): Promise<any> {
  // Validar cantidad
  if (!quantity || quantity <= 0) {
    throw new BadRequestException('La cantidad debe ser mayor a 0');
  }

  // Buscar el libro
  const book = await this.bookModel.findByPk(id);
  if (!book) throw new NotFoundException('Libro no encontrado');
  if (!book.availability) throw new BadRequestException('Libro no disponible');

  // Verificar stock disponible
  if (book.stock < quantity) {
    throw new BadRequestException(
      `Stock insuficiente. Stock disponible: ${book.stock}, solicitado: ${quantity}`,
    );
  }

  // Actualizar stock
  const newStock = book.stock - quantity;
  await book.update({
    stock: newStock,
    updatedBy: userId,
  });

  // Recargar el libro con las relaciones
  const updatedBook = await this.findOne(id);

  return {
    message: 'Venta procesada exitosamente',
    book: updatedBook,
    soldQuantity: quantity,
    remainingStock: newStock,
  };
}

  private async validateRelations(dto: CreateBookDto | UpdateBookDto): Promise<void> {
    const promises = [];

    if (dto.authorId) {
      console.log(dto.authorId, 'hola');
      
      promises.push(
        this.authorModel.findByPk(dto.authorId).then((author) => {
          if (!author) {
            throw new NotFoundException(`Autor con ID ${dto.authorId} no encontrado`);
          }
        }),
      );
    }

    if (dto.editorialId) {
      promises.push(
        this.editorialModel.findByPk(dto.editorialId).then((editorial) => {
          if (!editorial) {
            throw new NotFoundException(`Editorial con ID ${dto.editorialId} no encontrada`);
          }
        }),
      );
    }

    if (dto.genreId) {
      promises.push(
        this.genreModel.findByPk(dto.genreId).then((genre) => {
          if (!genre) {
            throw new NotFoundException(`Género con ID ${dto.genreId} no encontrado`);
          }
        }),
      );
    }

    await Promise.all(promises);
  }
}
