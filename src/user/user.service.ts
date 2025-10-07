import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // ✅ Return all users except admin
  async getAllUsers() {
    return this.prisma.user.findMany({
      where: {
        role: {
          not: 'ADMIN',
        },
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        role: true,
        createdAt: true,
      },
      orderBy: { id: 'asc' },
    });
  }
}
