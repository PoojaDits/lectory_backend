import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RejectSellerDto {
  @ApiPropertyOptional({ example: 'Documents are not valid' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
