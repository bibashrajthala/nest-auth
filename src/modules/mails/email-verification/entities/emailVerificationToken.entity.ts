import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'email_verification_tokens' })
export class EmailVerificationToken {
  @PrimaryGeneratedColumn() // Use PrimaryGeneratedColumn instead of PrimaryColumn
  id: number;

  @OneToOne(() => User, (user) => user.emailVerificationToken, {
    onDelete: 'CASCADE',
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
