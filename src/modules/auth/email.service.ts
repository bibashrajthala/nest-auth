import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { SignUpUserDto } from './dtos/signUp.dto';
import { createHash } from 'crypto';
import { Response as ResponseType } from 'express';
import { EmailVerificationDto } from './dtos/emailVerification.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailerService,
  ) {}

  async sendVerificationLink(emailVerificationDto: EmailVerificationDto) {
    const user = await this.usersService.findOneByEmail(
      emailVerificationDto?.email,
    );

    if (!user)
      throw new ForbiddenException('Email is not registered! Please sign up');

    const payload: IVerificationJwtPayload = {
      email: emailVerificationDto?.email,
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.EMAIL_VERIFICATION_SECRET,
      expiresIn: '2m',
    });

    const url = `${process.env.EMAIL_CONFIRMATION_URL}?token=${token}`;

    const emailResponse = await this.mailService.sendMail({
      to: emailVerificationDto?.email,
      from: process.env.SMTP_USER,
      subject: 'Email Verification',
      template: 'signUpConfirmation',
      context: {
        data: {
          name: user?.firstName, // only include this if name is entered while signing up, otherwise it will be empty(here it will be empty).
          url,
        },
      },
    });

    console.log('email res', emailResponse);

    return {
      success: true,
      message: 'Sent Verification Email Successfully',
    };
  }

  // refresh tokens
  async sendEmailVerificationToken(
    email: string,
    emailVerificationToken: string,
  ): Promise<IEmailVeficationToken> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) throw new ForbiddenException('Email is not registered');

    // check refreshToken in cookie(provided by jwt, ie  refresh token strategy payload , with hased refreshToken stored in db)
    const isMatch = this.compareEmailVerificationTokens(
      emailVerificationToken,
      user?.emailVerificationToken,
    );
    if (!isMatch) throw new ForbiddenException('Access Denied!');

    // generate new emailVerification
    const token = await this.getEmailVerificationToken({
      sub: user?.id,
      email: user?.email,
      role: user?.role,
    });

    // update refreshToken of db with newly generated hashed refreshToken
    await this.hashAndUpdateUserEmailVerificationToken(user?.id, token);

    return { emailVerificationToken: token };
  }

  async getEmailVerificationToken(payload: IJwtPayload) {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.EMAIL_VERIFICATION_SECRET,
      expiresIn: '2m',
    });
  }

  async hashAndUpdateUserEmailVerificationToken(
    userId: number,
    emailVerificationToken: string,
  ) {
    const hashedEmailVerificationToken = this.hashEmailVerificationToken(
      emailVerificationToken,
    );

    await this.usersService.update(userId, {
      emailVerificationToken: hashedEmailVerificationToken,
    });
  }

  hashEmailVerificationToken(emailVerificationToken: string): string {
    const hash = createHash('sha256');
    hash.update(emailVerificationToken);
    return hash.digest('hex');
  }

  compareEmailVerificationTokens(
    userToken: string,
    storedToken: string,
  ): boolean {
    const hashedUserToken = this.hashEmailVerificationToken(userToken);
    return hashedUserToken === storedToken;
  }
}

// types

export interface IVerificationJwtPayload {
  email: string;
}
export interface IJwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface IEmailVeficationToken {
  emailVerificationToken: string;
}
