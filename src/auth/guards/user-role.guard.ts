import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Auth } from '../models/auth.model';
import { ValidRoles } from '../interfaces';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  
  constructor(
    private readonly reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    
    const validRoles: ValidRoles[] = this.reflector.get( META_ROLES , context.getHandler() )

    if ( !validRoles ) return true;
    if ( validRoles.length === 0 ) return true;
    
    const req = context.switchToHttp().getRequest();
    const user = req.user as Auth;

    if ( !user ) 
      throw new BadRequestException('User not found');
    
    for (const role of user.roles as ValidRoles[] ) {
      if ( validRoles.includes( role as ValidRoles ) ) {
        return true;
      }
    }
    
    throw new ForbiddenException(
      `El usuario ${ user.name } no tiene permisos para acceder a este recurso`
    );
  }
}