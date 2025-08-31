import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  MaxLength,
  IsDateString,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBookDto {
  @ApiProperty({
    description: 'Título del libro',
    example: 'El Quijote de la Mancha',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El título es requerido' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  title: string;


  @ApiProperty({
    description: 'Fecha de publicación del libro',
    example: '2023-01-15',
    type: 'string',
    format: 'date',
  })
  @IsNotEmpty({ message: 'La fecha de publicación es requerida' })
  @IsDateString(
    {},
    { message: 'La fecha debe tener formato válido (YYYY-MM-DD)' },
  )
  publishedAt: string;

  @ApiProperty({
    description: 'Precio del libro',
    example: 25.99,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'El precio es requerido' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número con máximo 2 decimales' },
  )
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty({
    description: 'Cantidad en stock',
    example: 50,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'El stock es requerido' })
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  @Transform(({ value }) => parseInt(value))
  stock: number;

  @ApiProperty({
    description: 'Disponibilidad del libro',
    example: true,
  })
  @IsNotEmpty({ message: 'La disponibilidad es requerida' })
  @IsBoolean({ message: 'La disponibilidad debe ser un valor booleano' })
  availability: boolean;

  @ApiProperty({
    description: 'ID del autor',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsNotEmpty({ message: 'El ID del autor es requerido' })
  @IsString()
  authorId: string;

  @ApiProperty({
    description: 'ID de la editorial',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsNotEmpty({ message: 'El ID de la editorial es requerido' })
 @IsString()
  editorialId: string;

  @ApiProperty({
    description: 'ID del género',
    example: '550e8400-e29b-41d4-a716-446655440002',
    format: 'uuid',
  })
  @IsNotEmpty({ message: 'El ID del género es requerido' })
  @IsString()
  genreId: string;

  @ApiProperty({
    description: 'Imagen del libro',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  imageUrl?: string; // Este será manejado por FileInterceptor
}
