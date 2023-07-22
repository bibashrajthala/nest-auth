import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class UserDto {
  @ApiProperty({ description: 'id', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'email', example: 'hello@gmail.com' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'fullName', example: 'Bibash Rajthala' })
  @Expose()
  @Transform(({ obj }) => {
    const { firstName, middleName, lastName } = obj;
    const fullName = [firstName, middleName, lastName]
      .filter(Boolean)
      .join(' ');
    return fullName;
  })
  fullName: string;

  @ApiProperty({ description: 'role', example: 'user' })
  @Expose()
  role: string;
}
