import { IsEmail, IsString, MinLength, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidRoles } from '../interfaces';

export class CreateAuthDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'miContraseña123',
    minLength: 6
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string;
  
  @ApiProperty({
    description: 'Rol del usuario',
    example: ['admin', 'user'],
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'El rol debe ser un array' })
  @IsEnum(ValidRoles, { each: true, message: 'Rol inválido' })
  roles?: ValidRoles[];
}