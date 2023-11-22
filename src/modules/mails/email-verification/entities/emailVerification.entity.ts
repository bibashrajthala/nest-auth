import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'email_verification' })
export class EmailVerification {
  @PrimaryGeneratedColumn() // Use PrimaryGeneratedColumn instead of PrimaryColumn
  id: number;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
