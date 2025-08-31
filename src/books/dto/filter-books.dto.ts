import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsUUID,
  IsString,
  IsInt,
  Min,
  Max,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterBooksDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'ID del género para filtrar',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: 'El ID del género debe ser un UUID válido' })
  genreId?: string;

  @ApiPropertyOptional({
    description: 'ID de la editorial para filtrar',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: 'El ID de la editorial debe ser un UUID válido' })
  editorialId?: string;

  @ApiPropertyOptional({
    description: 'ID del autor para filtrar',
    example: '550e8400-e29b-41d4-a716-446655440002',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: 'El ID del autor debe ser un UUID válido' })
  authorId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por disponibilidad (stock > 0)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'La disponibilidad debe ser un valor booleano' })
  availability?: boolean;

  @ApiPropertyOptional({
    description: 'Término de búsqueda (título, descripción)',
    example: 'quijote',
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'title',
    enum: ['title', 'price', 'stock', 'createdAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString({ message: 'El campo de ordenamiento debe ser una cadena de texto' })
  @IsIn(['title', 'price', 'publishedDate', 'stock', 'createdAt'], {
    message: 'El campo de ordenamiento debe ser uno de: title, price, publishedDate, stock, createdAt',
  })
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Orden de clasificación',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString({ message: 'El orden debe ser una cadena de texto' })
  @IsIn(['ASC', 'DESC'], {
    message: 'El orden debe ser ASC o DESC',
  })
  order?: string = 'DESC';
}