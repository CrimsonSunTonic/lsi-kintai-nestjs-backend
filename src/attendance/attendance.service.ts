import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto';
import { GetMonthlyAttendanceDto } from './dto/get.attendance.monthly.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  private convertToJST(utcDate: Date): string {
    // JST is UTC+9
    const date = new Date(utcDate);
    date.setHours(date.getHours() + 9);
    
    // Format as ISO string with JST timezone indicator
    return date.toISOString().replace('Z', '+09:00');
  }

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
    const records = await this.prisma.attendance.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return records;
  }

  async getMonthlyAttendance(dto: GetMonthlyAttendanceDto) {
    // Create start and end of month in local time (will be converted to UTC by database)
    const startDate = new Date(dto.year, dto.month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(dto.year, dto.month, 0, 23, 59, 59, 999);
    // console.log("startDate is ", startDate)

    // console.log('Querying for month:', dto.month, dto.year);
    // console.log('Start Date (first day of month):', startDate.toISOString());
    // console.log('End Date (last day of month):', endDate.toISOString());

    const records = await this.prisma.attendance.findMany({
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

    
    // Convert UTC dates to JST
    const recordsInJST = records.map((record) => ({
      ...record,
      date: this.convertToJST(record.date),
      createdAt: this.convertToJST(record.createdAt),
      updatedAt: this.convertToJST(record.updatedAt),
    }));

    const recordsFomatted = handleWorkTimes(recordsInJST);

    return recordsFomatted;
  }

  async getTodayStatus(userId: number) {
    const today = new Date();
    const japanHour = (today.getUTCHours() + 9) % 24;
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

    let lastStatus: string | null = null;
    if (records.length > 0) {
      lastStatus = records[records.length - 1].status;
    }

    let lunchIn = !(records.some(r => r.status === 'lunchin')) && lastStatus === 'checkin' && japanHour >= 11 && japanHour <= 14;
    let lunchOut = !(records.some(r => r.status === 'lunchout')) && lastStatus === 'lunchin';

    let checkedIn = lastStatus === 'checkout' || lastStatus === null;
    let checkedOut = lastStatus === 'checkin' || lastStatus === 'lunchout';
    
    return { checkedIn, checkedOut, lunchIn, lunchOut };
  }
}

function handleWorkTimes(recordsInJST) {
    const recordsFormated = {};

    // --- Nhóm dữ liệu ---
    recordsInJST.forEach((rec) => {
      const dateKey = rec.date.split("T")[0];
      const time = rec.date.split("T")[1].slice(0, 5);
      const loc= [rec.latitude, rec.longitude];

      if (!recordsFormated[dateKey]) {
        recordsFormated[dateKey] = {
          checkin: [],
          lunchin: [],
          lunchout: [],
          checkout: [],
        };
      }

      switch (rec.status) {
        case "checkin":
          recordsFormated[dateKey].checkin.push({ time, loc });
          break;
        case "lunchin":
          recordsFormated[dateKey].lunchin.push({ time, loc });
          break;
        case "lunchout":
          recordsFormated[dateKey].lunchout.push({ time, loc });
          break;
        case "checkout":
          recordsFormated[dateKey].checkout.push({ time, loc });
          break;
      }
    });

    const toMinutes = (timeStr: string): number => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    const toHourDecimal = (minutes: number): number => {
      return Math.round((minutes / 60) * 100) / 100; 
    };

    for (const dateKey of Object.keys(recordsFormated)) {
      const rec = recordsFormated[dateKey];
      let totalWorkMinutes = 0;

      const pairCount = Math.min(rec.checkin.length, rec.checkout.length);
      for (let i = 0; i < pairCount; i++) {
        const start = toMinutes(rec.checkin[i].time);
        const end = toMinutes(rec.checkout[i].time);
        if (end > start) {
          totalWorkMinutes += end - start;
        }
      }

      const lunchCount = Math.min(rec.lunchin.length, rec.lunchout.length);
      for (let i = 0; i < lunchCount; i++) {
        const lunchStart = toMinutes(rec.lunchout[i].time);
        const lunchEnd = toMinutes(rec.lunchin[i].time);
        if (lunchStart > lunchEnd) {
          totalWorkMinutes -= lunchStart - lunchEnd;
        }
      }

      rec.workingHours = toHourDecimal(totalWorkMinutes / 60);
    }

    return recordsFormated;
}