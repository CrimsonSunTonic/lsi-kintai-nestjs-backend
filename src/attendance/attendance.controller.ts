import { Controller, Post, Body, UseGuards, Get, HttpCode, HttpStatus, ForbiddenException, Req, Patch } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { CreateAttendanceDto, UpdateAttendanceMonthlyDto } from './dto';
import { GetMonthlyAttendanceDto } from './dto/get.attendance.monthly.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiForbiddenResponse } from '@nestjs/swagger';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @HttpCode(HttpStatus.OK)
  @Get('me')
  @ApiOperation({ summary: 'Get current user attendance records' })
  @ApiResponse({ status: 200, description: 'Returns user attendance records' })
  async getMyAttendance(@GetUser('id') userId: number) {
    return this.attendanceService.getUserAttendance(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('monthly')
  @ApiOperation({ summary: 'Get monthly attendance (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns monthly attendance data' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin access required' })
  async getMonthlyAttendance(
    @GetUser() user: any,
    @Body() dto: GetMonthlyAttendanceDto,
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied. Admins only.');
    }
    return this.attendanceService.getMonthlyAttendance(dto);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get today\'s attendance status' })
  @ApiResponse({ status: 200, description: 'Returns today\'s attendance status' })
  async getTodayStatus(@Req() req) {
    const userId = req.user.id;
    return this.attendanceService.getTodayStatus(userId);
  }
  
  @HttpCode(HttpStatus.OK)
  @Post()
  @ApiOperation({ summary: 'Create attendance record' })
  @ApiResponse({ status: 200, description: 'Attendance record created' })
  async create(
    @GetUser('id') userId: number,
    @Body() dto: CreateAttendanceDto,
  ) {
    return this.attendanceService.createAttendance(userId, dto);
  }
  
  @Patch('update-monthly')
  @ApiOperation({ summary: 'Update attendance monthly by ID' })
  @ApiResponse({ status: 200, description: 'Attendance monthly record updated' })
  async update(@Body() dto: UpdateAttendanceMonthlyDto) {
    const result = await this.attendanceService.updateAttendanceMonthlyById(dto.id, dto);
    return result;
  }
}