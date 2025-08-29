import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { ICookiesService } from '../interfaces/cookies-service.interfaces';

@Injectable()
export class CookiesService implements ICookiesService {
  setCookies(res: Response, name: string, value: string): void {
    res.cookie(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });
  }

  getCookies(req: Request, name: string): string | undefined {
    // Verificar que req.cookies existe antes de acceder
    if (!req.cookies) {
      return undefined;
    }
    return req.cookies[name];
  }

  clearCookies(res: Response): void {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }
}
