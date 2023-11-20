import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailVerificationToken } from 'src/modules/mails/email-verification/entities/emailVerificationToken.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  AfterInsert,
  OneToOne,
  JoinColumn,
} from 'typeorm';

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

  @ApiPropertyOptional({ description: 'isVerified', example: true })
  @Column({
    nullable: false,
    default: false,
  })
  isVerified: boolean;

  @ApiPropertyOptional({
    description: 'refreshToken',
    example: 'fjdjfhjdf.fhdjkhf.hfjdhfj',
  })
  @Column({
    nullable: true,
    default: null,
  })
  refreshToken: string;

  @ApiProperty({ description: 'createdAt', example: '2023-07-06T09:34' })
  // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'updatedAt', example: '2023-07-06T09:34' })
  // @Column({
  //   type: 'timestamp',
  //   default: () => 'CURRENT_TIMESTAMP',
  //   onUpdate: 'CURRENT_TIMESTAMP',
  // })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(
    () => EmailVerificationToken,
    (EmailVerificationToken) => EmailVerificationToken.user,
    {
      cascade: true, // when a user is created, cascade it as well ie create a row linked with that user in this table
    },
  )
  emailVerificationToken: EmailVerificationToken;
}
