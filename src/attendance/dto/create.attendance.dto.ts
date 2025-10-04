import { IsLatitude, IsLongitude, IsNumber, IsString } from 'class-validator';

export class CreateAttendanceDto {
  @IsString()
  status: string;

  @IsNumber()
  @IsLatitude()
  latitude: number;

  @IsNumber()
  @IsLongitude()
  longitude: number;
}