import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMobilePhone, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'Amit' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Sharma' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'My Store Pvt Ltd' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({ example: 'Amit Sharma' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsMobilePhone('en-IN')
  mobileNumber?: string;

  @ApiPropertyOptional({ minLength: 8, example: 'NewPassword123!' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
