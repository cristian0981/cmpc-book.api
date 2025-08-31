import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { Genre } from './models/genre.model';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces';


@ApiTags('Géneros')
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Crear un nuevo género' })
  @ApiBody({ type: CreateGenreDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Género creado exitosamente',
    type: Genre,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe un género con ese nombre',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genresService.create(createGenreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los géneros' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de géneros obtenida exitosamente',
    type: [Genre],
  })
  findAll() {
    return this.genresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un género por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del género',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Género encontrado',
    type: Genre,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Género no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID de género inválido',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.genresService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un género' })
  @ApiParam({
    name: 'id',
    description: 'ID del género',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateGenreDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Género actualizado exitosamente',
    type: Genre,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Género no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe un género con ese nombre',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    return this.genresService.update(id, updateGenreDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un género' })
  @ApiParam({
    name: 'id',
    description: 'ID del género',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Género eliminado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Género no encontrado',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.genresService.remove(id);
  }
}
