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
import { Match } from '../decorators/match.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpUserDto {
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

  @ApiProperty({ description: 'passwordConfirm', example: 'Test@123' })
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  @Match('password')
  passwordConfirm: string;

  @ApiProperty({ description: 'role', example: 'user' })
  // @IsNotEmpty()
  @IsOptional()
  @IsString()
  role: string;
}
