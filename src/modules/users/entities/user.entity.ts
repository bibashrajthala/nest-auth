import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { EmailVerification } from '../../mails/email-verification/entities/emailVerification.entity';
import { Otp } from '../../otp/entities/otp.entity';
import { Provider } from '../types/user.types';
import { Profile } from 'src/modules/profile/entities/profile.entity';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({ description: 'id', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'email', example: 'test@gmail.com' })
  @Column({
    // name: 'email_address',
    unique: true,
    nullable: false,
    default: '',
  })
  email: string;

  @Column({
    nullable: false,
    default: '',
  })
  password: string;

  @ApiPropertyOptional({ description: 'role', example: 'user' })
  @Column({
    nullable: false,
    default: 'user',
  })
  role: string;

  @ApiPropertyOptional({ description: 'isActive', example: true })
  @Column({
    // name: 'is_active',
    nullable: false,
    default: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'isVerified', example: true })
  @Column({
    nullable: false,
    default: false,
  })
  isVerified: boolean; // email verification

  @ApiPropertyOptional({
    description: 'refreshToken',
    example: 'fjdjfhjdf.fhdjkhf.hfjdhfj',
  })
  @Column({
    nullable: true,
    default: null,
  })
  refreshToken: string;

  @ApiProperty({ description: 'provider', example: 'google' })
  @Column({
    type: 'enum',
    enum: Provider,
    nullable: false,
    default: Provider?.NORMAL,
  })
  provider: Provider;

  @ApiProperty({ description: 'createdAt', example: '2023-07-06T09:34' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'updatedAt', example: '2023-07-06T09:34' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(
    () => EmailVerification,
    (EmailVerification) => EmailVerification.user,
    {
      cascade: true, // when a user is created, cascade it as well ie create a row linked with that user in this table
    },
  )
  emailVerification: EmailVerification;

  @OneToOne(() => Otp, (Otp) => Otp.user, {
    cascade: true, // when a user is created, cascade it as well ie create a row linked with that user in this table
  })
  otp: Otp;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true, // when a user is created, cascade it as well ie create a profile row in profile table linked with this user
  })
  @JoinColumn()
  profile: Profile;
}
