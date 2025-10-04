import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signInDto, signUpDto } from './dto';

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
}
