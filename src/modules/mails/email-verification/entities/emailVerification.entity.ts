import { BaseEntity } from '../../../../models/BaseEntity';
import { User } from '../../../users/entities/user.entity';
import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'email_verification' })
export class EmailVerification extends BaseEntity {
  @OneToOne(() => User, (user) => user.emailVerification, {
    onDelete: 'CASCADE', // so that it gets deleted when its parent(ie user) is deleted
  })
  @JoinColumn()
  user: User;

  @Column({
    nullable: true,
    default: null,
  })
  emailVerificationToken: string;
}
