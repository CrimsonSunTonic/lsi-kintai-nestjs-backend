import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto';
import { GetMonthlyAttendanceDto } from './dto/get.attendance.monthly.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async createAttendance(userId: number, dto: CreateAttendanceDto) {
    const today = new Date();

    // Get start and end of today
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Check if user already checked in or out today
    const existingRecord = await this.prisma.attendance.findFirst({
      where: {
        userId,
        status: dto.status, // checkin OR checkout
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingRecord) {
      throw new Error(`You have already ${dto.status} today.`);
    }

    // ✅ If not, create the record
    return this.prisma.attendance.create({
      data: {
        userId,
        date: today,
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

  async getMonthlyAttendance(dto: GetMonthlyAttendanceDto) {
    const startDate = new Date(dto.year, dto.month - 1, 1);
    const endDate = new Date(dto.year, dto.month, 0, 23, 59, 59, 999);

    return this.prisma.attendance.findMany({
      where: {
        userId: dto.userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}
