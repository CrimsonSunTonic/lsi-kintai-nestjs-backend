import { Controller,  Get,  Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import type { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {

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
}
