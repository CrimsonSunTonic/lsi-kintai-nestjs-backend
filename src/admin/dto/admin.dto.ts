import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'John', description: 'User first name' })
    @IsString()
    @IsNotEmpty()
    firstname: string;

    @ApiProperty({ example: 'Doe', description: 'User last name' })
    @IsString()
    @IsNotEmpty()
    lastname: string;

    @ApiProperty({ example: 'USER', description: 'User role', enum: ['USER', 'ADMIN'] })
    @IsString()
    @IsNotEmpty()
    role?: 'USER' | 'ADMIN';
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'newuser@example.com', description: 'User email' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'John', description: 'User first name' })
  @IsString()
  @IsOptional()
  firstname?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'User last name' })
  @IsString()
  @IsOptional()
  lastname?: string;

  @ApiPropertyOptional({ example: 'ADMIN', description: 'User role', enum: ['USER', 'ADMIN'] })
  @IsString()
  @IsOptional()
  role?: 'USER' | 'ADMIN';
}