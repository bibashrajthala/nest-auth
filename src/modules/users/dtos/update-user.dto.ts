import {
  IsEmail,
  MaxLength,
  MinLength,
  Matches,
  IsString,
  IsOptional,
  IsBoolean,
  // IsStrongPassword,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  // @ApiPropertyOptional({ description: 'email', example: 'testuser@gmail.com' })
  // @IsOptional()
  // @IsEmail()
  // email: string;

  // @ApiPropertyOptional({ description: 'password', example: 'Test@123' })
  // @IsOptional()
  // @MinLength(8)
  // @MaxLength(100)
  // // @IsStrongPassword()
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message: 'password too weak',
  // })
  // password: string;

  // @ApiPropertyOptional({ description: 'role', example: 'user' })
  // @IsOptional()
  // @IsString()
  // role: string;

  @ApiPropertyOptional({ description: 'isActive', example: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'firstName', example: 'firstName' })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ description: 'middleName', example: '' })
  @IsOptional()
  @IsString()
  middleName: string;

  @ApiPropertyOptional({ description: 'lastName', example: 'lastName' })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'profilePicture', example: null })
  @IsOptional()
  @IsString()
  profilePicture: string;

  // @ApiPropertyOptional({ description: 'isVerified', example: true })
  // @IsOptional()
  // @IsBoolean()
  // isVerified: boolean;
}
