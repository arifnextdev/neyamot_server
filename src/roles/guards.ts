import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireRoles) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    if (!req.user) {
      return false;
    }

    const user = req.user;

    if (!user) {
      return false;
    }

    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];

    const hasRole = requireRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
