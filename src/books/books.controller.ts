import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBooksDto } from './dto/filter-books.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Auth as AuthModel } from '../auth/models/auth.model';
import { Book } from './models/book.model';


@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @Auth()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/books',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Solo se permiten archivos de imagen'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiOperation({ summary: 'Crear un nuevo libro' })
  @ApiBody({
    description: 'Datos del libro a crear',
    type: CreateBookDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Libro creado exitosamente',
    type: Book,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiBearerAuth()
  async create(
@Body()
createBookDto: CreateBookDto,  @GetUser()
user: AuthModel,
  ) {

    console.log(createBookDto);
    
    
    return this.booksService.create(createBookDto, user);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Obtener lista de libros con filtros y paginación' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Término de búsqueda',
    example: 'quijote',
  })
  @ApiQuery({
    name: 'genreId',
    required: false,
    description: 'ID del género',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'authorId',
    required: false,
    description: 'ID del autor',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiQuery({
    name: 'editorialId',
    required: false,
    description: 'ID de la editorial',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiQuery({
    name: 'availability',
    required: false,
    description: 'Filtrar por disponibilidad',
    example: true,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo de ordenamiento',
    example: 'title',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Orden (ASC/DESC)',
    example: 'ASC',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de libros obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Book' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  async findAll(@Query() filterDto: FilterBooksDto) {
    return this.booksService.findAll(filterDto);
  }

  @Get('export/csv')
  @Auth()
  @ApiOperation({ summary: 'Exportar libros a CSV' })
  @ApiResponse({
    status: 200,
    description: 'Archivo CSV generado exitosamente',
    headers: {
      'Content-Type': {
        description: 'Tipo de contenido',
        schema: { type: 'string', example: 'text/csv' },
      },
      'Content-Disposition': {
        description: 'Disposición del contenido',
        schema: { type: 'string', example: 'attachment; filename=books.csv' },
      },
    },
  })
  @ApiBearerAuth()
  async exportToCsv(@Res() res: Response, @Query() filterDto: FilterBooksDto) {
    const csv = await this.booksService.exportToCsv(filterDto);
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=books.csv');
    res.send(csv);
  }

  @Get('available')
  @Auth()
  @ApiOperation({ summary: 'Obtener libros disponibles (con stock)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de libros disponibles',
    type: [Book],
  })
  async getAvailableBooks() {
    return this.booksService.getAvailableBooks();
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener un libro por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del libro',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Libro encontrado',
    type: Book,
  })
  @ApiResponse({
    status: 404,
    description: 'Libro no encontrado',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  // @Auth()
  @ApiOperation({ summary: 'Actualizar un libro' })
  @ApiParam({
    name: 'id',
    description: 'ID del libro',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'Datos del libro a actualizar',
    type: UpdateBookDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Libro actualizado exitosamente',
    type: Book,
  })
  @ApiResponse({
    status: 404,
    description: 'Libro no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'El ISBN ya existe',
  })
  @ApiBearerAuth()
  @Auth()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
    @GetUser() user: AuthModel,
  ) {
    return this.booksService.update(id, updateBookDto, user);
  }

  @Patch(':id/stock')
  @Auth()
  @ApiOperation({ summary: 'Actualizar stock de un libro' })
  @ApiParam({
    name: 'id',
    description: 'ID del libro',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'Nueva cantidad de stock',
    schema: {
      type: 'object',
      properties: {
        stock: {
          type: 'number',
          example: 25,
          minimum: 0,
        },
      },
      required: ['stock'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Stock actualizado exitosamente',
    type: Book,
  })
  @ApiResponse({
    status: 404,
    description: 'Libro no encontrado',
  })
  @ApiBearerAuth()
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('stock') stock: number,
    @GetUser() user: AuthModel,
  ) {
    return this.booksService.updateStock(id, stock);
  }

  @Post(':id/sell')
@Auth()
@ApiOperation({ summary: 'Vender libros y descontar del stock' })
@ApiParam({
  name: 'id',
  description: 'ID del libro',
  example: '550e8400-e29b-41d4-a716-446655440000',
})
@ApiBody({
  description: 'Cantidad de libros a vender',
  schema: {
    type: 'object',
    properties: {
      quantity: {
        type: 'number',
        example: 2,
        minimum: 1,
        description: 'Cantidad de libros a vender',
      },
    },
    required: ['quantity'],
  },
})
@ApiResponse({
  status: 200,
  description: 'Venta procesada exitosamente',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Venta procesada exitosamente' },
      book: { $ref: '#/components/schemas/Book' },
      soldQuantity: { type: 'number', example: 2 },
      remainingStock: { type: 'number', example: 23 },
    },
  },
})
@ApiResponse({
  status: 400,
  description: 'Stock insuficiente o cantidad inválida',
})
@ApiResponse({
  status: 404,
  description: 'Libro no encontrado',
})
@ApiBearerAuth()
async sellBook(
  @Param('id', ParseUUIDPipe) id: string,
  @Body('quantity') quantity: number,
  @GetUser() user: AuthModel,
) {
  return this.booksService.sellBook(id, quantity, user.id);
}

  @Delete(':id')
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un libro (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID del libro',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Libro eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Libro no encontrado',
  })
  @ApiBearerAuth()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: AuthModel,
  ) {
    return this.booksService.remove(id, user);
  }
}
