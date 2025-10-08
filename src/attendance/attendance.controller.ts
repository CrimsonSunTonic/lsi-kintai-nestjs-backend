import { Controller, Post, Body, UseGuards, Get, HttpCode, HttpStatus, Query, ForbiddenException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { CreateAttendanceDto } from './dto';
import { GetMonthlyAttendanceDto } from './dto/get.attendance.monthly.dto';

@UseGuards(JwtGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  async create(
    @GetUser('id') userId: number,
    @Body() dto: CreateAttendanceDto,
  ) {
    return this.attendanceService.createAttendance(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getMyAttendance(@GetUser('id') userId: number) {
    return this.attendanceService.getUserAttendance(userId);
  }

  // 🔒 Admin-only endpoint
  @HttpCode(HttpStatus.OK)
  @Post('monthly')
  async getMonthlyAttendance(
    @GetUser() user: any, // Contains id, email, role, etc.
    @Body() dto: GetMonthlyAttendanceDto,
  ) {
    if (user.role !== 'ADMIN') {
      throw new
       ForbiddenException('Access denied. Admins only.');
    }

    return this.attendanceService.getMonthlyAttendance(dto);
  }
}
