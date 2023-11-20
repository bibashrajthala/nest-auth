import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailVerificationDto {
  @ApiProperty({ description: 'username/email', example: 'testuser@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
