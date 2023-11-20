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
import { EmailVerificationToken } from '../mails/email-verification/entities/emailVerificationToken.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailVerificationToken]),
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' }, // default expiration time, if expiresIn is not mentioned in jwt.sign()
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    EmailVerificationService,
    LocalStrategy,
    GoogleStrategy,
    JwtStrategy,
    RefreshTokenStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
