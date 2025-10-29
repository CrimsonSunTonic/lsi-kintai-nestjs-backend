import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as argon2 from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, private mailService: MailService) {}

   private generateRandomPassword(length = 8): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }


  // Create a new user
  async create(createUserDto: CreateUserDto) {
    console.log('=== [AdminService] create() called ===');
    console.log('Received DTO:', createUserDto);

    try {
      const plainPassword = this.generateRandomPassword();

      const hashedPassword = await argon2.hash(plainPassword);
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

      // Send welcome email with plain password
      await this.mailService.sendWelcomeEmail(
        user.email,
        plainPassword,
        `${user.lastname} ${user.firstname}`,
      );

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

    const roleMap = {
      ADMIN: '管理者',
      USER: '社員',
    };

    return users.map(u => ({
      ...u,
      role: roleMap[u.role] || u.role,
    }));
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
