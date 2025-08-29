import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com'
  })
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
    required: false
  })
  name?: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token: string;

  @ApiProperty({
    description: 'Token de refresco',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Información del usuario',
    type: UserResponseDto
  })
  user: UserResponseDto;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Token de refresco',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;
}

export class ValidateTokenDto {
  @ApiProperty({
    description: 'Token a validar',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  token: string;
}

export class LogoutDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;
}

export class TokenValidationResponseDto {
  @ApiProperty({
    description: 'Indica si el token es válido',
    example: true
  })
  valid: boolean;

  @ApiProperty({
    description: 'Información del usuario si el token es válido',
    type: UserResponseDto,
    required: false
  })
  user?: UserResponseDto;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Mensaje de respuesta',
    example: 'Operación exitosa'
  })
  message: string;
}