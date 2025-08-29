import { AuthResponse, Login, Register } from ".";

export interface IAuthService {
  login(credentials: Login): Promise<AuthResponse>;
  register(userData: Register): Promise<AuthResponse>;
  validateToken(token: string): Promise<boolean>;
  refreshToken(refreshToken: string): Promise<AuthResponse>;
  logout(userId: string): Promise<void>;
}