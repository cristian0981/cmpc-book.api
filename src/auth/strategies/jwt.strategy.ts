import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/sequelize';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ApiProperty } from '@nestjs/swagger';
import { Auth } from '../models/auth.model';
import { envs } from '../../settings/envs';
import { ValidRoles } from '../interfaces';

export class JwtPayload {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  sub: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com'
  })
  email: string;

  @ApiProperty({
    description: 'Roles del usuario',
    example: 'user,admin'
  })
  roles: ValidRoles[];  

  @ApiProperty({
    description: 'Timestamp de emisión',
    example: 1640995200
  })
  iat?: number;

  @ApiProperty({
    description: 'Timestamp de expiración',
    example: 1640998800
  })
  exp?: number;
}

export interface JwtUser {
  id: string;
  email: string;
  name?: string;
  roles?: ValidRoles[];
  isActive: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Auth)
    private readonly authModel: typeof Auth,
  ) {
    super({
      secretOrKey: envs.jwt_secret,
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Primero intenta extraer del header Authorization
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Luego intenta extraer de las cookies
        (request: Request) => {
          return request.cookies?.access_token || null;
        },
      ]),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    const { sub: userId } = payload;

    if (!userId) {
      throw new UnauthorizedException('Token inválido: ID de usuario no encontrado');
    }

    try {
      const user = await this.authModel.findOne({
        where: { 
          id: userId,
          isActive: true 
        },
        attributes: ['id', 'email', 'name', 'roles','isActive']
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado o inactivo');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        isActive: user.isActive,
      };
    } catch (error) {
      console.log(error);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error al validar el token');
    }
  }
}
