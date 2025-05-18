// // libs/auth/src/lib/symbiota.guard.ts

// import {
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';

// @Injectable()
// export class SymbiotaGuard implements CanActivate {
//   constructor(private reflector: Reflector, private authService: AuthService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const token = this.extractToken(request);

//     if (!token) {
//       throw new UnauthorizedException('Missing authentication token');
//     }

//     try {
//       const payload = await this.authService.verifyToken(token);
//       request.user = payload;

//       // Check Symbiota2 permissions
//       if (!payload.permissions.includes('data:clean')) {
//         throw new ForbiddenException('Insufficient permissions');
//       }

//       return true;
//     } catch (error) {
//       throw new UnauthorizedException('Invalid authentication token');
//     }
//   }

//   private extractToken(request: Request): string | null {
//     return request.headers.authorization?.split('Bearer ')[1] || null;
//   }
// }
