import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { signInDto, signUpDto } from './dto';
import * as argon2 from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(private prisma:PrismaService
        , private jwt: JwtService
        , private config: ConfigService
    ) {}
    // signup
    async signup(dto: signUpDto) {
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

            //Send back message
            return {
                message: 'Signup successful. Please log in to continue.',
                user: {
                    id: user.id,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    role: user.role,
                },
            };
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
            return { msg: 'Something went wrong, try again!' };
        }

    }

    // signin
    async signin(dto: signInDto) {
        //Find the user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        //If user does not exist, throw exception
        if (!user) {
            throw new ForbiddenException('Credentials incorrect: email');
        }

        //Compare password
        const pwMatches = await argon2.verify(
            user.password,
            dto.password,
        );

        //If password incorrect, throw exception
        if (!pwMatches) {
            throw new ForbiddenException('Credentials incorrect: password');
        }

        //Send back the user sign token
        return this.signToken(user.id, user.email, user.role);
    }

    async signToken(userId: number, email: string, role: string): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email,
            role
        };
        const token = await this.jwt.signAsync(payload, {
            expiresIn: this.config.get('JWT_EXPIRES_IN'),
            secret: this.config.get('JWT_SECRET'),
        });
        return { 
            access_token: token 
        }
    }
}
