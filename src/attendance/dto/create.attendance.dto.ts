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