import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as argon2 from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Create a new user
  async create(createUserDto: CreateUserDto) {
    console.log('=== [AdminService] create() called ===');
    console.log('Received DTO:', createUserDto);

    try {
      const hashedPassword = await argon2.hash(createUserDto.password);
      console.log('Password hashed successfully');

      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
          firstname: createUserDto.firstname,
          lastname: createUserDto.lastname,
          role: createUserDto.role,
        },
      });

      return {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Error in create():', error);
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Email is already taken');
      }
      throw new ForbiddenException('Something went wrong');
    }
  }

  // Find all users
  async findAll() {
    console.log('=== [AdminService] findAll() called ===');

    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { role: 'asc' },
        { firstname: 'asc' },
      ],
    });

    return users;
  }

  // Find one user by ID
  async findOne(id: number) {
    console.log('=== [AdminService] findOne() called ===');
    console.log('User ID:', id);

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.warn(`User with ID ${id} not found`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    console.log('Found user:', user);
    return user;
  }

  // Update user by ID
  async update(id: number, updateUserDto: UpdateUserDto) {
    console.log('=== [AdminService] update() called ===');
    console.log('User ID:', id);
    console.log('Received DTO:', updateUserDto);

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });

      return {
        message: 'User updated successfully',
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Error in update():', error);
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw new ForbiddenException('Something went wrong');
    }
  }

  // Remove user by ID
  async remove(id: number) {
    console.log('=== [AdminService] remove() called ===');
    console.log('User ID:', id);

    try {
      const user = await this.prisma.user.delete({
        where: { id },
      });

      return {
        message: 'User removed successfully',
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Error in remove():', error);
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw new ForbiddenException('Something went wrong');
    }
  }
}
