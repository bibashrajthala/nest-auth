import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/entities/user.entity';
import { createHash } from 'crypto';
import { EmailVerificationDto } from './dtos/emailVerification.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from './entities/emailVerification.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailerService,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //
  async update(userId: number, attrs: Partial<User>) {
    // Fetch the user using userId
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const userAndToken = await this.emailVerificationRepository.findOne({
      where: { user },
    });

    if (!userAndToken) {
      throw new NotFoundException('User not found!');
    }

    Object.assign(userAndToken, attrs); // using attrs update verificationToken
    return this.emailVerificationRepository.save(userAndToken);
  }

  /// utils

  // verification part

  // send link
  async sendVerificationLink(emailVerificationDto: EmailVerificationDto) {
    const user = await this.usersService.findOneByEmail(
      emailVerificationDto?.email,
    );

    if (!user)
      throw new NotFoundException('Email is not registered! Please sign up');

    // generate verification token
    const token = await this.getEmailVerificationToken({
      email: user?.email,
      userId: user?.id,
    });

    try {
      // if email is sent successfully

      const url = `${process.env.EMAIL_CONFIRMATION_URL}?token=${token}`;

      await this.mailService.sendMail({
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

      // hash the generated token
      const hashedEmailVerificationToken =
        this.hashEmailVerificationToken(token);

      // save the newly generated hashed token in db
      await this.emailVerificationRepository.update(
        { user: { id: user?.id } },
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
        'Could not send mail to the provided email',
      );
    }
  }

  async getEmailVerificationToken(payload: IVerificationJwtPayload) {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.EMAIL_VERIFICATION_SECRET,
      expiresIn: '2m',
    });
  }

  hashEmailVerificationToken(emailVerificationToken: string): string {
    const hash = createHash('sha256');
    hash.update(emailVerificationToken);
    return hash.digest('hex');
  }

  // confirmation part
  public async confirmEmail(email: string, token: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['emailVerification'],
    });

    if (user?.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (!user || !user?.emailVerification)
      throw new BadRequestException('Invalid Token');

    // check verificationToken provided matches with hased verificationToken stored in db
    const isMatch = this.compareEmailVerificationTokens(
      token,
      user?.emailVerification?.emailVerificationToken,
    );

    if (!isMatch) throw new BadRequestException('Invalid Token');

    if (!isMatch) throw new BadRequestException('Invalid Token');

    // mark users email as verified
    await this.usersService.update(user?.id, { isVerified: true });
    await this.emailVerificationRepository.update(
      { user: { id: user?.id } },
      { emailVerificationToken: null },
    );
  }

  public async decodeConfirmationToken(token: string) {
    // first verify token with secret key
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('EMAIL_VERIFICATION_SECRET'),
      });

      // if token is verified and token has no email payload then
      if (!payload || !payload?.email)
        throw new BadRequestException('Invalid Token');

      return payload?.email;
    } catch (error) {
      if (error?.name === 'TokenExpiredError')
        throw new BadRequestException(
          'This link has expired! Request for new link',
        );

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
