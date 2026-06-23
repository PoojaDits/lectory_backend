import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';
import { VALIDATION_MESSAGES } from '../../common/constants';

export class VerifyOtpDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '6-digit OTP', example: '123456' })
  @IsString({ message: VALIDATION_MESSAGES.OTP_REQUIRED })
  @Length(6, 6, { message: VALIDATION_MESSAGES.OTP_LENGTH })
  otp: string;
}
