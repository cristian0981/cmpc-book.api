import { ValidRoles } from "./valid-roles.interface";

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    roles?: ValidRoles[];
    avatar?: string;
  };
}