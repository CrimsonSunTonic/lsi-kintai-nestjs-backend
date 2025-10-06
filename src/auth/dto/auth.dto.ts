import { IsEmail, IsNotEmpty, IsString, Max, MinLength } from "class-validator";

export class signUpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
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