import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

import { Gender } from '../../users/types/user.types';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'profiles' })
export class Profile {
  @ApiProperty({ description: 'id', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

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

  @ApiProperty({ description: 'createdAt', example: '2023-07-06T09:34' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'updatedAt', example: '2023-07-06T09:34' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.profile)
  user: User;
}
