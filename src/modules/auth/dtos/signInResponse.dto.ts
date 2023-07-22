import { ApiProperty } from '@nestjs/swagger';

export class SignInResponseDto {
  @ApiProperty({
    description: 'accessToken',
    example: 'hsfjhjfh87438jsdhfsdjk.fdshf87343hfd.fdfsjhkjdshkjfhereu893',
  })
  accessToken: string;

  @ApiProperty({
    description: 'role',
    example: 'user',
  })
  role: string;
}
