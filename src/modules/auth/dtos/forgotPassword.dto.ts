import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { OtpType } from 'src/modules/otp/types/otp.types';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'type', example: 'forgot_password' })
  @IsNotEmpty()
  @IsEnum(OtpType)
  type: OtpType;

  @ApiProperty({ description: 'email', example: 'testuser@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
