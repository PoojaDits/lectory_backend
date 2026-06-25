import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BookStatus } from '../../common/enums';

export class UpdateBookStatusDto {
  @ApiProperty({ enum: BookStatus, example: BookStatus.APPROVED, description: 'Book approval status' })
  @IsEnum(BookStatus)
  @IsNotEmpty()
  status: BookStatus;

  @ApiPropertyOptional({ example: '2026-06-25T18:25:00.000Z', description: 'ISO Timestamp sent by frontend' })
  @IsOptional()
  @IsString()
  reviewedAt?: string;
}
