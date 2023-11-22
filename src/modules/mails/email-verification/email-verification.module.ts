import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerification } from './entities/emailVerification.entity';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationService } from './email-verification.service';
import { UsersService } from 'src/modules/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/modules/users/users.module';
import { User } from 'src/modules/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailVerification, User]), //
    JwtModule.register({
      secret: process.env.EMAIL_VERIFICATION_SECRET,
      signOptions: { expiresIn: '2m' }, // default expiration time, if expiresIn is not mentioned in jwt.sign()
    }),

    UsersModule,
  ],
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService, UsersService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
