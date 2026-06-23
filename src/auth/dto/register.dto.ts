import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '../../common/enums';
import { VALIDATION_MESSAGES } from '../../common/constants';

export class RegisterDto {
  @ApiProperty({
    enum: UserRole,
    example: UserRole.CUSTOMER,
    description: 'customer or seller',
  })
  @IsEnum(UserRole, { message: VALIDATION_MESSAGES.ROLE_INVALID })
  role: UserRole;

  @ApiProperty({ example: 'test@example.com' })
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  email: string;

  @ApiProperty({ minLength: 8, example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: VALIDATION_MESSAGES.PASSWORD_MIN })
  password: string;

  // --- Customer only ---
  @ApiProperty({ required: false, example: 'Amit' })
  @ValidateIf((o) => o.role === UserRole.CUSTOMER)
  @IsString()
  @IsNotEmpty({ message: VALIDATION_MESSAGES.FIRST_NAME_REQUIRED })
  firstName?: string;

  @ApiProperty({ required: false, example: 'Sharma' })
  @ValidateIf((o) => o.role === UserRole.CUSTOMER)
  @IsString()
  @IsNotEmpty({ message: VALIDATION_MESSAGES.LAST_NAME_REQUIRED })
  lastName?: string;

  // --- Seller only ---
  @ApiProperty({ required: false, example: 'My Store Pvt Ltd' })
  @ValidateIf((o) => o.role === UserRole.SELLER)
  @IsString()
  @IsNotEmpty({ message: VALIDATION_MESSAGES.BUSINESS_NAME_REQUIRED })
  businessName?: string;

  @ApiProperty({ required: false, example: 'Amit Sharma' })
  @ValidateIf((o) => o.role === UserRole.SELLER)
  @IsString()
  @IsNotEmpty({ message: VALIDATION_MESSAGES.CONTACT_PERSON_REQUIRED })
  contactPerson?: string;

  @ApiProperty({ required: false, example: '9876543210' })
  @ValidateIf((o) => o.role === UserRole.SELLER)
  @IsMobilePhone('en-IN', {}, { message: VALIDATION_MESSAGES.MOBILE_INVALID })
  mobileNumber?: string;
}
