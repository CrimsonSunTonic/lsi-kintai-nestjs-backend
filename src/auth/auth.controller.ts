import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, signInDto, signUpDto } from './dto';
import { GetUser } from '../auth/decorator';
import type { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // signup
    @Post('signup')
    signup(@Body() dto: signUpDto) {
        return this.authService.signup(dto);
    }

    // signin
    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() dto: signInDto) {
        return this.authService.signin(dto);
    }

    @UseGuards(JwtGuard)
    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    changePassword(
        @GetUser() user: User,
        @Body() dto: ChangePasswordDto
    ) {
        return this.authService.changePassword(user.id, dto);
    }
}
