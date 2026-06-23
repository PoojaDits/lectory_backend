import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({ example: true, description: 'Set account active/inactive' })
  @IsBoolean()
  isActive: boolean;
}
