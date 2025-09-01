import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './models/author.model';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Crear un nuevo autor' })
  @ApiBody({ type: CreateAuthorDto })
  @ApiResponse({
    status: 201,
    description: 'Autor creado exitosamente',
    type: Author,
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un autor con ese nombre',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  create(@Body() createAuthorDto: CreateAuthorDto): Promise<Author> {
    return this.authorsService.create(createAuthorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los autores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de autores obtenida exitosamente',
    type: [Author],
  })
  findAll(): Promise<Author[]> {
    return this.authorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un autor por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID único del autor (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Autor encontrado exitosamente',
    type: Author,
  })
  @ApiResponse({
    status: 404,
    description: 'Autor no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (debe ser un UUID)',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Author> {
    return this.authorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un autor' })
  @ApiParam({
    name: 'id',
    description: 'ID único del autor (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateAuthorDto })
  @ApiResponse({
    status: 200,
    description: 'Autor actualizado exitosamente',
    type: Author,
  })
  @ApiResponse({
    status: 404,
    description: 'Autor no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un autor con ese nombre',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido o datos de entrada inválidos',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author> {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un autor (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID único del autor (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Autor eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Autor no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (debe ser un UUID)',
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.authorsService.remove(id);
  }
}
