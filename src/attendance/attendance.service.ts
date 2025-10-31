import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto';
import { GetMonthlyAttendanceDto } from './dto/get.attendance.monthly.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async createAttendance(userId: number, dto: CreateAttendanceDto) {
    const nowUTC = new Date(); // Current UTC time (what Prisma/Postgres expects)
    const JST_OFFSET = 9 * 60 * 60 * 1000;
    const DateJST = new Date(nowUTC.getTime() + JST_OFFSET); // Convert to JST for returning

    // Save UTC timestamp
    const savedRecord = await this.prisma.attendance.create({
      data: {
        userId,
        date: nowUTC,
        status: dto.status,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });

    return {
      message: "Attendance recorded successfully",
      id: savedRecord.id,
      userId: savedRecord.userId,
      status: savedRecord.status,
      latitude: savedRecord.latitude,
      longitude: savedRecord.longitude,
      date: DateJST,
    };
  }

  async getUserAttendance(userId: number) {
    return this.prisma.attendance.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMonthlyAttendance(dto: GetMonthlyAttendanceDto) {
    // JST is UTC+9
    const JST_OFFSET = 9 * 60 * 60 * 1000;

    // Create start and end times in JST
    const startDateJST = new Date(dto.year, dto.month - 1, 1, 0, 0, 0, 0);
    const endDateJST = new Date(dto.year, dto.month, 0, 23, 59, 59, 999);

    // Convert to UTC for DB query (subtract JST offset)
    const startDateUTC = new Date(startDateJST.getTime() - JST_OFFSET);
    const endDateUTC = new Date(endDateJST.getTime() - JST_OFFSET);

    const records = await this.prisma.attendance.findMany({
      where: {
        userId: dto.userId,
        date: {
          gte: startDateUTC,
          lte: endDateUTC,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Convert date fields back to JST for returning
    const recordsWithJST = records.map((r) => ({
      ...r,
      date: new Date(r.date.getTime() + JST_OFFSET),
    }));

    return recordsWithJST;
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
      lunchIn: records.some(r => r.status === 'lunchin'),
      lunchOut: records.some(r => r.status === 'lunchout'),
    };
  }
}
