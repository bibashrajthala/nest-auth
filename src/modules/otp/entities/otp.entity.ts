import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OtpType } from '../types/otp.types';
import { User } from 'src/modules/users/entities/user.entity';

@Entity({ name: 'otps' })
export class Otp {
  @ApiProperty({ description: 'id', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'secret', example: 'secret43asfsdf' })
  @Column({ nullable: true, default: null })
  secret: string;

  @ApiProperty({ description: 'type', example: 'forget_password' })
  @Column({
    type: 'enum',
    enum: OtpType,
    nullable: true,
    default: null,
  })
  type: OtpType | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.otp, {
    onDelete: 'CASCADE', // so that it gets deleted when its parent(ie user) is deleted
  })
  @JoinColumn()
  user: User;
}
