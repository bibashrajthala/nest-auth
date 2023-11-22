import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refreshTokens.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { EmailVerificationService } from '../mails/email-verification/email-verification.service';
import { EmailVerification } from '../mails/email-verification/entities/emailVerification.entity';
import { OtpModule } from '../otp/otp.module';
import { OtpService } from '../otp/otp.service';
import { Otp } from '../otp/entities/otp.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailVerification, Otp]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' }, // default expiration time, if expiresIn is not mentioned in jwt.sign()
    }),

    UsersModule,
    OtpModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,

    LocalStrategy,
    GoogleStrategy,
    JwtStrategy,
    RefreshTokenStrategy,

    UsersService,
    EmailVerificationService,
    OtpService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
