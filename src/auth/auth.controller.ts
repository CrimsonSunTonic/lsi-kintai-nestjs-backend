import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // signup
    @Post('signup')
    signup() {
        return this.authService.signup();
    }

    // signin
    @Post('signin')
    signin() {
        return this.authService.signin();
    }
}
