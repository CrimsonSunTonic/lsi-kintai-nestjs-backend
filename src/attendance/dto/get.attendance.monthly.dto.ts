import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetMonthlyAttendanceDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @Type(() => Number)
  @IsInt()
  userId: number;

  @ApiProperty({ example: 12, description: 'Month (1-12)', minimum: 1, maximum: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2024, description: 'Year', minimum: 2000, maximum: 2100 })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;
}