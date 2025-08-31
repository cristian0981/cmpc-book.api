import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'Nombre del autor',
    example: 'Gabriel García Márquez',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre del autor es requerido' })
  @IsString({ message: 'El nombre del autor debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre del autor no puede exceder 255 caracteres' })
  name: string;
}