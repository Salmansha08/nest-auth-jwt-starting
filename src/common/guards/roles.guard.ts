import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../enums';
import { ROLES_KEY } from '../decorators';
import { AuthUserInterface } from '../interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = context.switchToHttp().getRequest<AuthUserInterface>();

    if (!user.id) {
      this.logger.warn('Access denied - No user found in request');
      return false;
    }

    if (!user.role && (!user.roles || user.roles.length === 0)) {
      this.logger.warn(
        `Access denied - User without role attempted to access protected resource`,
      );
      return false;
    }

    const userRoles: RoleEnum[] = user.roles || (user.role ? [user.role] : []);

    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role),
    );

    if (!hasRequiredRole) {
      this.logger.warn(
        `Access denied - User with roles [${userRoles.join(', ')}] attempted to access resource requiring [${requiredRoles.join(', ')}]`,
      );
    }

    return hasRequiredRole;
  }
}
