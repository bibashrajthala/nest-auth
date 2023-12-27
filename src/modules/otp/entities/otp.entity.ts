import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { OtpType } from '../types/otp.types';
import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../../models/BaseEntity';

@Entity({ name: 'otps' })
export class Otp extends BaseEntity {
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

  @Column({ type: 'timestamp', nullable: true, default: null })
  expiresAt: Date;

  @OneToOne(() => User, (user) => user.otp, {
    onDelete: 'CASCADE', // so that it gets deleted when its parent(ie user) is deleted
  })
  @JoinColumn()
  user: User;
}
