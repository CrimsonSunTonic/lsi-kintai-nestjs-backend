import { IsLatitude, IsLongitude, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({ example: 'PRESENT', description: 'Attendance status' })
  @IsString()
  status: string;

  @ApiProperty({ example: 40.7128, description: 'Latitude coordinate' })
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: -74.0060, description: 'Longitude coordinate' })
  @IsNumber()
  @IsLongitude()
  longitude: number;
}

export class UpdateAttendanceMonthlyDto {
  @ApiProperty({ example: '1', description: 'Attendance ID' })
  @IsString()
  id: number;

  @ApiProperty({ example: '2025-11-11T11:57:45.164Z', description: 'Attendance date' })
  @IsString()
  date: string;

  @ApiProperty({ example: 'PRESENT', description: 'Attendance status' })
  @IsString()
  status: string;

  @ApiProperty({ example: 40.7128, description: 'Latitude coordinate' })
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: -74.0060, description: 'Longitude coordinate' })
  @IsNumber()
  @IsLongitude()
  longitude: number;
}