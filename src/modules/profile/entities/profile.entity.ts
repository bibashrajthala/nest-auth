import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Column, Entity, OneToOne } from 'typeorm';

import { Gender } from '../../users/types/user.types';
import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../../models/BaseEntity';

@Entity({ name: 'profiles' })
export class Profile extends BaseEntity {
  @ApiProperty({ description: 'firstName', example: 'firstName' })
  @Column({
    nullable: false,
    default: '',
  })
  firstName: string;

  @ApiPropertyOptional({ description: 'middleName', example: '' })
  @Column({
    nullable: false,
    default: '',
  })
  middleName: string;

  @ApiProperty({ description: 'lastName', example: 'lastName' })
  @Column({
    nullable: false,
    default: '',
  })
  lastName: string;

  @ApiPropertyOptional({ description: 'profilePicture', example: null })
  @Column({
    nullable: true,
    default: null,
  })
  profilePicture: string;

  @ApiProperty({ description: 'gender', example: 'M' })
  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
    default: null,
  })
  gender: Gender;

  @OneToOne(() => User, (user) => user.profile)
  user: User;
}
