import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { Otp } from './entities/otp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Otp, User]), UsersModule],
  providers: [OtpService, UsersService],
  exports: [OtpService],
})
export class OtpModule {}
