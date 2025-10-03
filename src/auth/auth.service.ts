import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { signUpDto } from './dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
    constructor(private prisma:PrismaService) {}
    // signup
    async signup(dto: signUpDto) {
        console.log(dto);
        // Generate the password hash
        const hash = await argon2.hash(dto.password);
        //Save the new user in the db
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hash,
            },
        });

        console.log(user);
        const { password, ...userWithoutPassword } = user;

        //Return the saved user
        return userWithoutPassword;
    }

    // signin
    signin() {
        return { msg: 'signin' };
    }
}
