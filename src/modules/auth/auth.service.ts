import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { SignUpUserDto } from './dtos/signUp.dto';
import { createHash } from 'crypto';
import { Response as ResponseType } from 'express';
import { EmailVerificationService } from '../mails/email-verification/email-verification.service';
import { ForgotPasswordDto } from './dtos/forgotPassword.dto';
import { OtpService } from '../otp/otp.service';
import { ResetPasswordDto } from './dtos/resetPassword.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../users/dtos/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailVerificationService: EmailVerificationService,
    private otpService: OtpService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // sign up
  async signUpLocal(signUpUserDto: SignUpUserDto) {
    const user = await this.usersService.findOneByEmail(signUpUserDto?.email);

    if (user) {
      throw new BadRequestException('Email already exists!');
    }

    const hashedPassword = await this.hashPassword(signUpUserDto?.password);

    const { passwordConfirm, ...rest } = signUpUserDto;
    const newUser = { ...rest, password: hashedPassword };

    const registeredUser = await this.usersService.create(newUser);
    // return registeredUser;

    await this.emailVerificationService.sendVerificationLink({
      email: registeredUser?.email,
    });

    const response = {
      success: true,
      message:
        'Verification Link has been sent to your email.Please verify your email through it',
    };

    return response;
  }

  // sign in
  async signInLocal(user: Partial<User>): Promise<ITokens> {
    const registeredUser = await this.usersService.findOneByEmail(user?.email);

    if (!registeredUser)
      throw new NotFoundException('This email is not registered yet!');

    // send verification link if user's email is not verified
    if (registeredUser && !registeredUser?.isVerified) {
      await this.emailVerificationService.sendVerificationLink({
        email: registeredUser?.email,
      });

      throw new BadRequestException(
        'Email not verified. Verification Link has been sent to your email.Please verify your email through it',
      );
    }

    const payload = { sub: user?.id, email: user?.email, role: user?.role };

    const tokens = await this.getTokens(payload); // get accessToken and refreshToken
    await this.hashAndUpdateUserRefreshToken(user?.id, tokens.refreshToken); // store new hashed refreshToken in users table
    return tokens;
  }

  // sign out
  async signOut(userId: number) {
    await this.usersService.update(userId, { refreshToken: null });
  }

  // refresh tokens
  async refreshTokens(userId: number, refreshToken: string): Promise<ITokens> {
    const user = await this.usersService.findOne(userId);

    if (!user || !user?.refreshToken)
      throw new ForbiddenException('Access Denied');

    // check refreshToken in cookie(provided by jwt, ie  refresh token strategy payload , with hased refreshToken stored in db)
    const isMatch = this.compareRefreshTokens(refreshToken, user?.refreshToken);
    if (!isMatch) throw new ForbiddenException('Access Denied');

    // generate new accessToken and refreshToken
    const tokens = await this.getTokens({
      sub: user?.id,
      email: user?.email,
      role: user?.role,
    });

    // update refreshToken of db with newly generated hashed refreshToken
    await this.hashAndUpdateUserRefreshToken(user?.id, tokens?.refreshToken);

    return tokens;
  }

  async signInGoogle(user: CreateUserDto) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const userExists = await this.usersService.findOneByEmail(user?.email);

    // if user dont exist , register user to database first
    if (!userExists) {
      // const newUserRegistered = await this.signUpLocal(user);
      const newUserRegistered = await this.usersService.create({
        ...user,
        isVerified: true, // google account is already verified by google
      });
      return this.signInLocal(newUserRegistered);
    }

    return this.signInLocal(userExists);
  }

  async forgetPassword(forgotPasswordDto: ForgotPasswordDto) {
    const response = await this.otpService.sendOtpMail(forgotPasswordDto);
    return response;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: resetPasswordDto?.email },
      relations: ['otp'],
    });

    if (!user || !user?.otp) throw new BadRequestException('Invalid OTP');

    const isValid = await this.otpService.verifyOtp(
      user?.otp?.id,
      resetPasswordDto?.otpCode,
    );

    if (!isValid) throw new ForbiddenException('Invalid OTP');

    const hashedPassword = await this.hashPassword(resetPasswordDto?.password);

    // update user password
    await this.usersService.update(user?.id, {
      password: hashedPassword,
    });

    // reset otp for user
    await this.otpService.update(user?.otp?.id, {
      secret: null,
      type: null,
      expiresAt: null,
    });
  }

  // utilities

  async validateUser(email: string, password: string): Promise<Partial<User>> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials!');
    }

    const isMatch = await bcrypt.compare(password, user?.password);

    if (!isMatch) return null;

    const { password: hashedPassword, ...rest } = user;

    return rest;
  }

  async getTokens(payload: IJwtPayload): Promise<ITokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async hashAndUpdateUserRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = this.hashRefreshToken(refreshToken);

    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  storeTokenInCookie(res: ResponseType, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds, same as expiration time of refresh token set above
      httpOnly: true,
    });
  }

  hashRefreshToken(refreshToken: string): string {
    const hash = createHash('sha256');
    hash.update(refreshToken);
    return hash.digest('hex');
  }

  compareRefreshTokens(userToken: string, storedToken: string): boolean {
    const hashedUserToken = this.hashRefreshToken(userToken);
    return hashedUserToken === storedToken;
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }
}

// types

export interface IJwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface IAccessToken {
  accessToken: string;
}

export interface ITokens extends IAccessToken {
  refreshToken: string;
}
