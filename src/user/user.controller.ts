import { Controller, ForbiddenException, Get, Req, UseGuards } from '@nestjs/common';
import { AdminGuard, JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import type { User } from '@prisma/client';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiForbiddenResponse } from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user data' })
  getMe(@GetUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
    };
  }

  @UseGuards(AdminGuard)
  @Get('all')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns all users' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin access required' })
  async getAllUsers(@GetUser() user: User) {
    return this.userService.getAllUsers();
  }
}