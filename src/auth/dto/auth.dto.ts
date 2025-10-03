import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class signUpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    firstname: string;

    @IsString()
    @IsNotEmpty()
    lastname: string;
}

export class signInDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}