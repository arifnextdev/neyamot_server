// // role.guard.ts
// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   ForbiddenException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { ROLES_KEY } from './decorator';

// @Injectable()
// export class RoleGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<string[]>(
//       ROLES_KEY,
//       [context.getHandler(), context.getClass()],
//     );

//     if (!requiredRoles) return true;

//     const { user } = context.switchToHttp().getRequest();

//     if (!user || !user.roles) {
//       throw new ForbiddenException('No roles found');
//     }

//     const hasRole = requiredRoles.some((role) => user.roles.includes(role));
//     if (!hasRole) {
//       throw new ForbiddenException('You do not have the required role');
//     }

//     return true;
//   }
// }
