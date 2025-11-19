import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto, UpdateAttendanceMonthlyDto } from './dto';
import { GetMonthlyAttendanceDto } from './dto/get.attendance.monthly.dto';
import * as moment from 'moment-timezone';

enum AttendanceStatus {
  checkedIn = 'checkin',
  lunchOut = 'lunchout',
  lunchIn = 'lunchin',
  checkedOut = 'checkout',
}

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
    const jstNow = moment.tz('Asia/Tokyo');
    const japanHour = jstNow.hour();

    const startOfDayJST = jstNow.clone().startOf('day');
    const endOfDayJST = jstNow.clone().endOf('day');

    const startUTC = startOfDayJST.clone().tz('UTC').toDate();
    const endUTC = endOfDayJST.clone().tz('UTC').toDate();

    const records = await this.prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: startUTC,
          lt: endUTC,
        },
      },
      orderBy: { date: 'asc' },
    });

    let lastStatus: string | null = null;
    if (records.length > 0) {
      lastStatus = records[records.length - 1].status;
    }

    const lunchIn =
      !records.some((r) => r.status === 'lunchin') &&
      lastStatus === 'checkin' &&
      japanHour >= 11 &&
      japanHour <= 13;

    const lunchOut =
      !records.some((r) => r.status === 'lunchout') &&
      lastStatus === 'lunchin';

    const checkedIn = lastStatus === 'checkout' || lastStatus === null;
    const checkedOut = lastStatus === 'checkin' || lastStatus === 'lunchout';

    return { checkedIn, checkedOut, lunchIn, lunchOut };
  }

  async createAttendance(userId: number, dto: CreateAttendanceDto) {
    // Check if the button status is true before saving
    const statusCheck = await this.getTodayStatus(userId);
    
    const status = (Object.keys(AttendanceStatus) as (keyof typeof AttendanceStatus)[]).find(k => AttendanceStatus[k] === dto.status) || "";
    if (!statusCheck[status]) {
      throw new HttpException(
        `Cannot save status "${dto.status}" because the button is not enabled.`,
        HttpStatus.BAD_REQUEST
      );
    }

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

  async updateAttendanceMonthlyById(attendanceId: number, dto: UpdateAttendanceMonthlyDto) {
    // Save UTC timestamp
    const savedRecord = await this.prisma.attendance.update({
        where: { id: attendanceId },
        data: dto,
      });

    return {
      message: "Attendance recorded successfully",
      savedRecord
    };
  }
}

// Format work times and group records by date
function handleWorkTimes(recordsInJST) {
  const recordsFormated: any = {};

  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const shifts = [
    { name: "main", start: "09:00", end: "18:00" },
    { name: "ot1", start: "18:30", end: "22:00" },
    { name: "ot2", start: "22:30", end: "27:00" },
  ];

  const defaultBreaks = [
    { start: "12:00", end: "13:00" }, // trừ nếu không có lunch
    { start: "18:00", end: "18:30" },
    { start: "22:00", end: "22:30" },
  ];

  const getOverlapMinutes = (
    work: { start: number; end: number },
    shift: { start: string; end: string },
    breaks: { start: number; end: number }[]
  ) => {
    let sStart = toMinutes(shift.start);
    let sEnd = toMinutes(shift.end);
    if (sEnd < sStart) sEnd += 1440;

    let start = Math.max(work.start, sStart);
    let end = Math.min(work.end, sEnd);
    if (end <= start) return 0;

    let total = end - start;

    for (const b of breaks) {
      const overlap = Math.max(
        0,
        Math.min(end, b.end) - Math.max(start, b.start)
      );
      total -= overlap;
    }

    return total;
  };

  // --- Group by date ---
  recordsInJST.forEach((rec) => {
    const dateKey = rec.date.split("T")[0];
    const time = rec.date.split("T")[1].slice(0, 5);
    const loc = [rec.latitude, rec.longitude];

    if (!recordsFormated[dateKey]) {
      recordsFormated[dateKey] = {
        checkin: [],
        checkout: [],
        lunchin: [],
        lunchout: [],
        workingHours: {},
      };
      shifts.forEach((s) => (recordsFormated[dateKey].workingHours[s.name] = 0));
    }

    switch (rec.status) {
      case "checkin":
        recordsFormated[dateKey].checkin.push({ id: rec.id, time, loc });
        break;
      case "checkout":
        recordsFormated[dateKey].checkout.push({ id: rec.id, time, loc });
        break;
      case "lunchin":
        recordsFormated[dateKey].lunchin.push({ id: rec.id, time, loc });
        break;
      case "lunchout":
        recordsFormated[dateKey].lunchout.push({ id: rec.id, time, loc });
        break;
    }
  });

  for (const dateKey of Object.keys(recordsFormated)) {
    const rec = recordsFormated[dateKey];

    const nCheckin = rec.checkin.length;
    const nCheckout = rec.checkout.length;
    const pairs: { start: number; end: number }[] = [];

    // Ghép checkin → checkout, bỏ checkin không có checkout
    for (let i = 0; i < nCheckin && i < nCheckout; i++) {
      let start = toMinutes(rec.checkin[i].time);
      let end = toMinutes(rec.checkout[i].time);
      if (end < start) end += 1440;
      pairs.push({ start, end });
    }

    // Lunch breaks
    const lunchBreaks: { start: number; end: number }[] = [];
    const nLunch = Math.min(rec.lunchin.length, rec.lunchout.length);
    for (let i = 0; i < nLunch; i++) {
      let lStart = toMinutes(rec.lunchin[i].time);
      let lEnd = toMinutes(rec.lunchout[i].time);
      if (lEnd < lStart) lEnd += 1440;
      pairs.forEach((p) => {
        if (lEnd > p.start && lStart < p.end) {
          lunchBreaks.push({
            start: Math.max(lStart, p.start),
            end: Math.min(lEnd, p.end),
          });
        }
      });
    }

    // Thêm default breaks nhưng **bỏ break 12:00–13:00 nếu có lunch**
    defaultBreaks.forEach((b) => {
      if (b.start === "12:00" && nLunch > 0) return;
      lunchBreaks.push({ start: toMinutes(b.start), end: toMinutes(b.end) });
    });

    // Tính giờ từng pair
    for (const pair of pairs) {
      for (const s of shifts) {
        rec.workingHours[s.name] += getOverlapMinutes(pair, s, lunchBreaks);
      }
    }

    for (const s of shifts) {
      rec.workingHours[s.name] = +(rec.workingHours[s.name] / 60).toFixed(1);
    }
  }

  return recordsFormated;
}
