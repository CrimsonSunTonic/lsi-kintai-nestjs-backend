import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prisma:PrismaService) {}
    // signup
    signup() {
        return { msg: 'signup' };
    }

    // signin
    signin() {
        return { msg: 'signin' };
    }
}
