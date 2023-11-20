import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/entities/user.entity';
import { SignUpUserDto } from '../../auth/dtos/signUp.dto';
import { createHash } from 'crypto';
import { Response as ResponseType } from 'express';
import { EmailVerificationDto } from './dtos/emailVerification.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerificationToken } from './entities/emailVerificationToken.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailerService,
    @InjectRepository(EmailVerificationToken)
    private emailVerificationTokenRepository: Repository<EmailVerificationToken>,
  ) {}

  //
  async update(userId: number, attrs: Partial<User>) {
    // Fetch the user using userId
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const userAndToken = await this.emailVerificationTokenRepository.findOne({
      where: { user },
    });

    if (!userAndToken) {
      throw new NotFoundException('User not found!');
    }

    Object.assign(userAndToken, attrs); // using attrs update verificationToken
    return this.emailVerificationTokenRepository.save(userAndToken);
  }

  /// utils

  // verification part

  // send link
  async sendVerificationLink(emailVerificationDto: EmailVerificationDto) {
    const user = await this.usersService.findOneByEmail(
      emailVerificationDto?.email,
    );

    if (!user)
      throw new ForbiddenException('Email is not registered! Please sign up');

    // generate verification token
    const token = await this.getEmailVerificationToken({
      email: user?.email,
      userId: user?.id,
    });

    try {
      // if email is sent successfully

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

      // hash the generated token
      const hashedEmailVerificationToken =
        this.hashEmailVerificationToken(token);

      // save the newly generated hashed token in db
      await this.emailVerificationTokenRepository.update(
        { user: user },
        {
          emailVerificationToken: hashedEmailVerificationToken,
        },
      );

      return {
        success: true,
        message: 'Sent Verification Email Successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        'Could not send mail to this provided email',
      );
    }
  }

  // send verification link
  // async sendEmailVerificationToken(
  //   email: string,
  //   emailVerificationToken: string,
  // ): Promise<IEmailVeficationToken> {
  //   const user = await this.usersService.findOneByEmail(email);

  //   if (!user) throw new ForbiddenException('Email is not registered');

  //   // check refreshToken in cookie(provided by jwt, ie  refresh token strategy payload , with hased refreshToken stored in db)
  //   const isMatch = this.compareEmailVerificationTokens(
  //     emailVerificationToken,
  //     user?.emailVerificationToken,
  //   );
  //   if (!isMatch) throw new ForbiddenException('Access Denied!');

  //   // generate new emailVerification
  //   const token = await this.getEmailVerificationToken({
  //     sub: user?.id,
  //     email: user?.email,
  //     role: user?.role,
  //   });

  //   // update refreshToken of db with newly generated hashed refreshToken
  //   await this.hashAndUpdateUserEmailVerificationToken(user?.id, token);

  //   return { emailVerificationToken: token };
  // }

  async getEmailVerificationToken(payload: IVerificationJwtPayload) {
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

    await this.emailVerificationTokenRepository.update(userId, {
      emailVerificationToken: hashedEmailVerificationToken,
    });
  }

  hashEmailVerificationToken(emailVerificationToken: string): string {
    const hash = createHash('sha256');
    hash.update(emailVerificationToken);
    return hash.digest('hex');
  }

  // confirmation part
  public async confirmEmail(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (user?.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // mark users email as verified
    await this.usersService.update(user?.id, { isVerified: true });
    await this.emailVerificationTokenRepository.update(
      { user: user },
      { emailVerificationToken: null },
    );
  }

  public async decodeConfirmationToken(token: string) {
    try {
      // first verify token with secret key
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('EMAIL_VERIFICATION_SECRET'),
      });

      console.log('payload', payload);

      // if token is verified and token as email payload then
      if (typeof payload === 'object' && 'userId' in payload) {
        const user = await this.usersService.findOne(payload?.userId);

        // const user = await this.usersRepository.findOne(userId, {
        //   relations: ['emailVerificationToken'],
        // });

        console.log('user', user);

        if (!user) throw new BadRequestException('Invalid Token');

        const emailVerificationToken =
          await this.emailVerificationTokenRepository.findOneBy({
            user,
          });

        console.log('emailVerificationToken', emailVerificationToken);

        // check verificationToken provided matches with hased verificationToken stored in db
        const isMatch = this.compareEmailVerificationTokens(
          token,
          emailVerificationToken?.emailVerificationToken,
        );
        if (!isMatch) throw new BadRequestException('Invalid Token');

        console.log('isMatch', isMatch);

        return payload.email;
      }
      throw new BadRequestException('Invalid Token');
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Invalid Token');
    }
  }

  compareEmailVerificationTokens(token: string, storedToken: string): boolean {
    const hashedUserToken = this.hashEmailVerificationToken(token);
    return hashedUserToken === storedToken;
  }
}

// types

export interface IVerificationJwtPayload {
  email: string;
  userId: number;
}

export interface IEmailVeficationToken {
  emailVerificationToken: string;
}
