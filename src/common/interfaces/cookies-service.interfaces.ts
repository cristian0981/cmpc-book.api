import { Request, Response } from 'express';

export interface ICookiesService {
  setCookies(res: Response, name: string, value: any): void;
  getCookies(req: Request, name: string, value: any): string;
  clearCookies(res: Response): void;
}
