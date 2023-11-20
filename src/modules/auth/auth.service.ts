import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailVerificationService: EmailVerificationService,
  ) {}

  // sign up
  async signUpLocal(signUpUserDto: SignUpUserDto) {
    const user = await this.usersService.findOneByEmail(signUpUserDto?.email);

    if (user) {
      throw new BadRequestException('Email already exists!');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(signUpUserDto?.password, salt);

    const { passwordConfirm, ...rest } = signUpUserDto;
    const newUser = { ...rest, password: hashedPassword };

    // return await this.usersService.create(newUser);
    const registeredUser = await this.usersService.create(newUser);

    const emailsentResponse =
      await this.emailVerificationService.sendVerificationLink({
        email: registeredUser?.email,
      });

    console.log('emailresponse', emailsentResponse);

    return registeredUser;
  }

  // sign in
  async signInLocal(user: Partial<User>): Promise<ITokens> {
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

  async signInGoogle(user) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const userExists = await this.usersService.findOneByEmail(user?.email);

    // if user dont exist , register user to database first
    if (!userExists) {
      // const newUserRegistered = await this.signUpLocal(user);
      const newUserRegistered = await this.usersService.create(user);
      return this.signInLocal(newUserRegistered);
    }

    return this.signInLocal(userExists);
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
