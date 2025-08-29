import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Auth } from './models/auth.model';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { IAuthService, AuthResponse } from './interfaces';
import { envs } from '../settings/envs';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @InjectModel(Auth)
    private readonly authModel: typeof Auth,
    private readonly jwtService: JwtService,
  ) {}

  async register(userData: CreateAuthDto): Promise<AuthResponse> {
    const existingUser = await this.authModel.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await this.authModel.create({
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
    });

    return await this.generateTokens(user);
  }

  async login(credentials: LoginAuthDto): Promise<AuthResponse> {
    const user = await this.authModel.findOne({
      where: { email: credentials.email, isActive: true },
    });

    if (!user || !await bcrypt.compare(credentials.password, user.password)) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generateTokens(user);
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: envs.jwt_secret,
      });
      
      const user = await this.authModel.findByPk(payload.sub);
      return !!user && user.isActive;
    } catch {
      return false;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: envs.jwt_refresh_secret,
      });
      
      const user = await this.authModel.findOne({
        where: { id: payload.sub, refreshToken, isActive: true },
      });

      if (!user) {
        throw new UnauthorizedException('Token de refresh inválido');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Token de refresh inválido');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.authModel.update(
      { refreshToken: null },
      { where: { id: userId } }
    );
  }

  private async generateTokens(user: Auth): Promise<AuthResponse> {
    const payload = { sub: user.id, email: user.email };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: envs.jwt_secret,
      expiresIn: '1h',
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: envs.jwt_refresh_secret,
      expiresIn: '7d',
    });

    // Guardar refresh token en la base de datos
    await user.update({ refreshToken });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
