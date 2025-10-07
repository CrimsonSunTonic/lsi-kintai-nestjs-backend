import { Controller,  ForbiddenException,  Get,  Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import type { User } from '@prisma/client';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@GetUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
    };
  }

  @Get('all')
  async getAllUsers(@GetUser() user: User) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied: Admins only');
    }

    return this.userService.getAllUsers();
  }
}
