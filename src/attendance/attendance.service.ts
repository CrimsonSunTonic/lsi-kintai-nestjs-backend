import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto';
import { GetMonthlyAttendanceDto } from './dto/get.attendance.monthly.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async createAttendance(userId: number, dto: CreateAttendanceDto) {
    const nowJST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
    );

    return this.prisma.attendance.create({
      data: {
        userId,
        date: nowJST,
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

  async getTodayStatus(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const records = await this.prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    return {
      checkedIn: records.some(r => r.status === 'checkin'),
      checkedOut: records.some(r => r.status === 'checkout'),
    };
  }
}
