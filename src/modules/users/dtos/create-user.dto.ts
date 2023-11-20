import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsString,
  IsOptional,
  // IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmailVerificationToken } from 'src/modules/mails/email-verification/entities/emailVerificationToken.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'email', example: 'testuser@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'password', example: 'Test@123' })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  // @IsStrongPassword()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @ApiProperty({ description: 'role', example: 'user' })
  @IsNotEmpty()
  @IsString()
  role: string;

  // @IsOptional()
  // emailVerificationToken?: EmailVerificationToken;
}
