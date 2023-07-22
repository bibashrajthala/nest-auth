import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignInUserDto {
  @ApiProperty({ description: 'username/email', example: 'testuser@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  username: string;

  @ApiProperty({ description: 'password', example: 'Test@123' })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({ description: 'rememberMe', example: false })
  @IsBoolean()
  rememberMe: boolean;

  @ApiPropertyOptional({ description: 'role', example: 'user' })
  @IsNotEmpty()
  @IsString()
  role: string;
}
