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
import { EditorialsService } from './editorials.service';
import { CreateEditorialDto } from './dto/create-editorial.dto';
import { UpdateEditorialDto } from './dto/update-editorial.dto';
import { Editorial } from './models/editorial.model';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('Editoriales')
@Controller('editorials')
export class EditorialsController {
  constructor(private readonly editorialsService: EditorialsService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Crear una nueva editorial' })
  @ApiBody({ type: CreateEditorialDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Editorial creada exitosamente',
    type: Editorial,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe una editorial con ese nombre',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  create(@Body() createEditorialDto: CreateEditorialDto) {
    return this.editorialsService.create(createEditorialDto);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Obtener todas las editoriales' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de editoriales obtenida exitosamente',
    type: [Editorial],
  })
  findAll() {
    return this.editorialsService.findAll();
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Obtener una editorial por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la editorial',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Editorial encontrada',
    type: Editorial,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Editorial no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID de editorial inválido',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.editorialsService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Actualizar una editorial' })
  @ApiParam({
    name: 'id',
    description: 'ID de la editorial',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateEditorialDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Editorial actualizada exitosamente',
    type: Editorial,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Editorial no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe una editorial con ese nombre',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID de editorial inválido o datos de entrada inválidos',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEditorialDto: UpdateEditorialDto,
  ) {
    return this.editorialsService.update(id, updateEditorialDto);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Eliminar una editorial' })
  @ApiParam({
    name: 'id',
    description: 'ID de la editorial',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Editorial eliminada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Editorial no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID de editorial inválido',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.editorialsService.remove(id);
  }
}
