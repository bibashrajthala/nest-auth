import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { authenticator } from 'otplib';
import { Otp } from './entities/otp.entity';
import { CreateOtpDto } from './dto/create-otp.dto';
import { OtpType } from './types/otp.types';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OtpService {
  constructor(
    private usersService: UsersService,
    private mailService: MailerService,

    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /// utils

  async update(otpId: number, attrs: IUpdateAttribures) {
    return await this.otpRepository.update({ id: otpId }, attrs);
  }

  // send mail with otp
  async sendOtpMail(sendOtpDto: CreateOtpDto) {
    const user = await this.usersService.findOneByEmail(sendOtpDto?.email);

    if (!user)
      throw new ForbiddenException('Email is not registered! Please sign up');

    const secret = authenticator.generateSecret();

    // generate otp code
    const code = this.generateOtp(secret);

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
              name: user?.firstName, // only include this if name is entered while signing up, otherwise it will be empty(here it will be empty).
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
        },
      );

      return {
        success: true,
        message: 'Sent Otp to provided email Successfully',
      };
    } catch (error) {
      throw new BadRequestException('Could not send otp to the provided email');
    }
  }

  generateOtp(secret: string) {
    const otpCode = authenticator.generate(secret);

    const isValid = authenticator.check(otpCode, secret);

    if (!isValid)
      throw new InternalServerErrorException(
        'Unable to provide otp at the moment',
      );
    return otpCode;
  }

  // vefify Otp
  async verifyOtp(otpId: number, code: string) {
    // if (authenticator.timeRemaining() <= 0) {
    // }

    const otp = await this.otpRepository.findOneBy({ id: otpId });

    if (!otp) throw new BadRequestException('Invalid OTP');

    const isVerified = authenticator.verify({
      token: code,
      secret: otp?.secret,
    });

    return isVerified;
  }
}

// types
interface IUpdateAttribures {
  secret: string | null;
  type: OtpType | null;
}
