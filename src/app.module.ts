import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwtAuthentication.guard';
//
import { dataSource } from './database/data-source';

// config
import typeormConfig from './config/orm.config';
import pinoLoggerConfig from './config/pinoLogger.config';
import configOptions from './config/config';
import throttlerConfig from './config/rateLimit.config';
import smtpConfig from './config/smtp.config';

// business modules
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailVerificationModule } from './modules/mails/email-verification/email-verification.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot(configOptions),

    // Pino Logger
    LoggerModule.forRoot(pinoLoggerConfig),

    // Rate Limit /  Throttler
    ThrottlerModule.forRootAsync({
      useFactory: () => throttlerConfig,
    }),

    // TypeOrm
    // TypeOrmModule.forRoot(typeormConfig),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        dataSource.initialize();
        return typeormConfig;
      },
    }),

    // Nodemailer for SMTP
    MailerModule.forRoot(smtpConfig),

    // Business modules
    UsersModule,
    AuthModule,
    EmailVerificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // global jwt auth guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // global rate limit per user
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  constructor() {
    console.log('Environment Running => ', process.env.NODE_ENV);
  }
}
