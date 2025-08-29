import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiOkResponse
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { 
  AuthResponseDto, 
  RefreshTokenDto, 
  ValidateTokenDto, 
  LogoutDto,
  TokenValidationResponseDto,
  MessageResponseDto
} from './dto/auth-response.dto';
import { CookiesService } from '../common/services/cookie.service';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, 
    private readonly cookiesService: CookiesService
  ) {}  

  @Post('register')
  @ApiOperation({ 
    summary: 'Registrar nuevo usuario',
    description: 'Crea una nueva cuenta de usuario en el sistema'
  })
  @ApiCreatedResponse({
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos'
  })
  @ApiBody({ type: CreateAuthDto })
  async register(@Body() createAuthDto: CreateAuthDto, @Res() res: Response) {
    const resp = await this.authService.register(createAuthDto);
    this.cookiesService.setCookies(res, 'access_token', resp.access_token);
    this.cookiesService.setCookies(res, 'refresh_token', resp.refresh_token);
    return res.status(201).json(resp);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica al usuario y devuelve tokens de acceso. Los tokens también se configuran como cookies HTTPOnly.'
  })
  @ApiOkResponse({
    description: 'Login exitoso',
    type: AuthResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos'
  })
  @ApiBody({ type: LoginAuthDto })
  async login(@Body() loginAuthDto: LoginAuthDto, @Res() res: Response) {
    const resp = await this.authService.login(loginAuthDto);
    this.cookiesService.setCookies(res, 'access_token', resp.access_token);
    this.cookiesService.setCookies(res, 'refresh_token', resp.refresh_token);
    return res.status(200).json(resp);
  }


  @Post('logout')
  @ApiOperation({ 
    summary: 'Cerrar sesión',
    description: 'Invalida el refresh token del usuario y limpia las cookies'
  })
  @ApiOkResponse({
    description: 'Logout exitoso',
    type: MessageResponseDto
  })
  @ApiBadRequestResponse({
    description: 'ID de usuario requerido'
  })
  @ApiBody({ type: LogoutDto })
  logout(@Body('userId') userId: string, @Res() res: Response) {
    this.authService.logout(userId);
    this.cookiesService.clearCookies(res);
    return res.status(200).json({ message: 'Logout exitoso' });
  }

}
