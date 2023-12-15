import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { SignUpUserDto } from 'src/modules/auth/dtos/signUp.dto';
import { Provider } from '../types/user.types';

export class CreateUserDto extends OmitType(SignUpUserDto, [
  'passwordConfirm',
]) {
  @ApiPropertyOptional({ description: 'provider', example: 'google' })
  @IsOptional()
  @IsEnum(Provider)
  provider?: Provider;

  @ApiPropertyOptional({ description: 'provider', example: 'google' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

// // for picking certain properties
// export class CreateUserDto extends PickType(SignUpUserDto, [
//   'passwordConfirm',
//   'password',
// ]) {}
