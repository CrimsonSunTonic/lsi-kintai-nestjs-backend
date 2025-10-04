import { Controller, Post, Body, Req, UseGuards, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { CreateAttendanceDto } from './dto';

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

}
