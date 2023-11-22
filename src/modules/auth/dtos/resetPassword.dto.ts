// reset-password.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { SignUpUserDto } from './signUp.dto';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class ResetPasswordDto extends PickType(SignUpUserDto, [
  'email',
  'password',
  'passwordConfirm',
]) {
  @ApiProperty({ description: 'otpCode', example: '123456' })
  @IsNotEmpty()
  @IsNumberString()
  otpCode: string;
}
