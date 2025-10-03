import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class signUpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
    firstname: any;
    lastname: any;
}