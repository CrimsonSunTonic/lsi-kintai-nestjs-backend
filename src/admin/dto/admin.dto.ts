import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
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

    @IsString()
    @IsNotEmpty()
    role?: 'USER' | 'ADMIN';
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  lastname?: string;

  @IsString()
  @IsOptional()
  role?: 'USER' | 'ADMIN';
}
