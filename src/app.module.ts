import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwtAuthentication.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
//
import { dataSource } from './database/data-source';

import smtpConfig from './config/smtp.config';
import { MailerModule } from '@nestjs-modules/mailer';
import typeormConfig from './config/orm.config';
import pinoLoggerConfig from './config/pinoLogger.config';
import configOptions from './config/config';
import throttlerConfig from './config/rateLimit.config';

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

    UsersModule,
    AuthModule,
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
