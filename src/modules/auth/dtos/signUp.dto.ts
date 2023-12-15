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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignUpUserDto {
  @ApiProperty({ description: 'firstName', example: 'test' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'middleName', example: '' })
  @IsString()
  middleName: string;

  @ApiProperty({ description: 'lastName', example: 'user' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    description: 'profilePicture',
    example: 'https://profilepicture.png',
  })
  @IsOptional()
  @IsString()
  profilePicture: string;

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
  @IsOptional()
  @IsString()
  role: string;
}
