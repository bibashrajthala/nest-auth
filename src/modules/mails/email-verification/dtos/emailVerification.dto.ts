import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class EmailVerificationDto {
  @ApiProperty({ description: 'username/email', example: 'testuser@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  // @ApiProperty({ description: 'userId', example: 1 })
  // @IsNotEmpty()
  // @IsNumber()
  // userId: number;
}
