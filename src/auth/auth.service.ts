import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { signUpDto } from './dto';
import * as argon2 from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
    constructor(private prisma:PrismaService) {}
    // signup
    async signup(dto: signUpDto) {
        console.log(dto);
        // Generate the password hash
        const hash = await argon2.hash(dto.password);
        try {
            //Save the new user in the db
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    password: hash,
                    firstname: dto.firstname,
                    lastname: dto.lastname,
                },
            });

            console.log(user);
            const { password, ...userWithoutPassword } = user;

            //Return the saved user
            return userWithoutPassword;
        }
        catch (error) {
            //If there is a error, throw it
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException(
                        'Credentials taken',
                    );
                }
            }
            return { msg: 'Something went wrong' };
        }

    }

    // signin
    async signin() {
        return { msg: 'signin' };
    }
}
