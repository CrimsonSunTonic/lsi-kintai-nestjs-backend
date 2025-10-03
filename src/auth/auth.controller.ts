import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signUpDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // signup
    @Post('signup')
    signup(@Body() dto: signUpDto) {
        return this.authService.signup(dto);
    }

    // signin
    @Post('signin')
    signin() {
        return this.authService.signin();
    }
}
