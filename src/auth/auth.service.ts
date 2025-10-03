import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    // signup
    signup() {
        return { msg: 'signup' };
    }

    // signin
    signin() {
        return { msg: 'signin' };
    }
}
