import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { CreateOtpDto } from './dto/create-otp.dto';
import { OtpType } from './types/otp.types';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  constructor(
    private usersService: UsersService,
    private mailService: MailerService,

    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {}

  async update(otpId: number, attrs: IUpdateAttribures) {
    return await this.otpRepository.update({ id: otpId }, attrs);
  }

  /// utils

  // send mail with otp
  async sendOtpMail(sendOtpDto: CreateOtpDto) {
    const user = await this.usersService.findOneByEmail(sendOtpDto?.email);

    if (!user)
      throw new ForbiddenException('Email is not registered! Please sign up');

    const currentDate = new Date();
    const expirationDuration = 2; // 2minutes
    const expiryDate = new Date(
      currentDate.getTime() + expirationDuration * 60000,
    ); // Add milliseconds for expiration duration

    // generate otp code
    const { code, secret } = await this.generateOtp();

    try {
      // if email is sent successfully

      if (sendOtpDto?.type === OtpType?.FORGOT_PASSOWORD) {
        await this.mailService.sendMail({
          to: sendOtpDto?.email,
          from: process.env.SMTP_USER,
          subject: 'Otp to reset password',
          template: 'forgotPassword',
          context: {
            data: {
              name: user?.profile?.firstName, // only include this if name is entered while signing up, otherwise it will be empty(here it will be empty).
              code,
            },
          },
        });
      }

      // save the newly generated hashed token in db
      await this.otpRepository.update(
        { user: { id: user?.id } },
        {
          secret,
          type: sendOtpDto?.type,
          expiresAt: expiryDate,
        },
      );

      return {
        success: true,
      };
    } catch (error) {
      throw new BadRequestException('Could not send otp to the provided email');
    }
  }

  async generateOtp() {
    const otpCode = crypto.randomInt(100000, 999999)?.toString();

    const hashedOtpCode = await this.hashOtpCode(otpCode);

    return { code: otpCode, secret: hashedOtpCode };
  }

  async hashOtpCode(code: string) {
    const salt = await bcrypt.genSalt();
    const hashedCode = await bcrypt.hash(code, salt);
    return hashedCode;
  }

  // vefify Otp
  async verifyOtp(otpId: number, code: string) {
    const otp = await this.otpRepository.findOne({
      where: { id: otpId },
      relations: ['user'],
    });

    if (!otp || !otp?.secret || !otp?.expiresAt)
      throw new BadRequestException('Invalid OTP');

    if (new Date(otp?.expiresAt)?.getTime() < Date.now()) {
      // // reset otp for user
      // await this.update(otp?.user?.id, {
      //   secret: null,
      //   type: null,
      //   expiresAt: null,
      // });
      throw new BadRequestException('This OTP has been expired');
    }

    const isVerified = await bcrypt.compare(code, otp?.secret);

    return isVerified;
  }
}

// types
interface IUpdateAttribures {
  secret: string | null;
  type: OtpType | null;
  expiresAt: Date | null;
}
