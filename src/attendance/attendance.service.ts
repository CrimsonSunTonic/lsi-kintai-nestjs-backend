import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async createAttendance(userId: number, dto: CreateAttendanceDto) {
    return this.prisma.attendance.create({
      data: {
        userId,
        date: new Date(),
        status: dto.status,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
  }

  async getUserAttendance(userId: number) {
    return this.prisma.attendance.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
