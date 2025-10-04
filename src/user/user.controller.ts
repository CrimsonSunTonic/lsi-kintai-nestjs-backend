import { Controller,  Get,  Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import type { User } from 'generated/prisma';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {

  @Get('me')
  getMe(@GetUser() user: User) {
    return user.id;
  }
}
