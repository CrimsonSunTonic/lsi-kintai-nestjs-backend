import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, signInDto, signUpDto } from './dto';
import { GetUser } from '../auth/decorator';
import type { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @ApiOperation({ summary: 'User registration' })
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 403, description: 'Bad request, User taken' })
    signup(@Body() dto: signUpDto) {
        return this.authService.signup(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: 200, description: 'User successfully logged in' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    signin(@Body() dto: signInDto) {
        return this.authService.signin(dto);
    }

    @ApiBearerAuth()
    @UseGuards(JwtGuard)
    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Change user password' })
    @ApiResponse({ status: 200, description: 'Password successfully changed' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    changePassword(
        @GetUser() user: User,
        @Body() dto: ChangePasswordDto
    ) {
        return this.authService.changePassword(user.id, dto);
    }
}