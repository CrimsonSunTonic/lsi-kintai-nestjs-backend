import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtGuard } from './jwt.guard';

@Injectable()
export class AdminGuard extends JwtGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, run JwtGuard logic to authenticate
    const isAuth = await super.canActivate(context);
    if (!isAuth) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied: Admins only');
    }

    return true;
  }
}
