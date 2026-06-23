import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, Max, Min } from 'class-validator';
import { SellerStatus, UserRole } from '../../common/enums';

export class QueryUsersDto {
  @ApiPropertyOptional({ enum: UserRole, description: 'Filter by role' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: SellerStatus, description: 'Filter sellers by status' })
  @IsOptional()
  @IsEnum(SellerStatus)
  sellerStatus?: SellerStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ example: 'amit', description: 'Search email/name/business/mobile' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
