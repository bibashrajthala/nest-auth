import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthService, IAccessToken, IJwtPayload } from './auth.service';
import { UsersService } from '../users/users.service';
import { SignUpUserDto } from './dtos/signUp.dto';
import { SignInUserDto } from './dtos/signIn.dto';
import { LocalAuthGuard } from 'src/guards/localAuthentication.guard';
import { GoogleOauthGuard } from 'src/guards/googleOAuth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from '../users/dtos/user.dto';
import { SignInResponseDto } from './dtos/signInResponse.dto';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { JwtAuthGuard } from 'src/guards/jwtAuthentication.guard';
import {
  CurrentUser,
  CurrentUserId,
} from '../users/decorators/currentUser.decorator';
import { IApiResponse } from 'src/types/api.types';
import { User } from '../users/entities/user.entity';
import { RefreshAuthGuard } from 'src/guards/refreshAuthentication.guard';
import { IRefreshJwtPayload } from './strategies/refreshTokens.strategy';
import { Public } from './decorators/public.decorator';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  // sign up
  @ApiCreatedResponse({
    type: UserDto,
    description: 'Succesfully registered user!',
  })
  @Public()
  @Serialize(UserDto)
  @HttpCode(HttpStatus.CREATED)
  @Post('/signup')
  async signUpLocal(
    @Body() signUpUserDto: SignUpUserDto,
  ): Promise<IApiResponse<any>> {
    // ): Promise<IApiResponse<User>> {
    const data = await this.authService.signUpLocal(signUpUserDto);

    const response = {
      success: true,
      message: 'Successfully Registered User!',
      data,
    };
    return response;
  }

  // sign in
  @Throttle(3, 60) // Override default configuration for Rate limiting and duration by only 3 requests in 60seconds.
  @ApiBody({
    description: 'Sign in payload',
    type: SignInUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User Sign up Successful!',
    type: SignInResponseDto,
  })
  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  async signInLocal(
    @Request() req: ExpressRequest,
    @Response({ passthrough: true }) res: ExpressResponse, // pass http only cookie with response
  ): Promise<IApiResponse<IAccessToken>> {
    const tokens = await this.authService.signInLocal(req?.user);

    if (!tokens) throw new ForbiddenException('Access Denied!');

    this.authService?.storeTokenInCookie(res, tokens?.refreshToken); // store refreshToken as httponly cookie and set it in response

    const response = {
      success: true,
      message: 'User Sign In Successful!',
      data: {
        accessToken: tokens?.accessToken, // send accessToken with response
      },
    };
    return response;
  }

  // current user
  @SkipThrottle() // remove / skip the rate limit
  @ApiBearerAuth('jwtAuth') // This is the one that needs to match the name in main.ts for swagger auth
  @ApiOkResponse({ description: 'Gives current/active user', type: UserDto })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get('/whoami')
  whoami(@CurrentUser() user: IJwtPayload): IApiResponse<IJwtPayload> {
    const response = {
      success: true,
      message: 'Successfully fetched current user!',
      data: user,
    };

    // if you want other info of current user fetch user by id, using id in user jwtPayload then send response
    return response;
  }

  // sign out
  @ApiBearerAuth('jwtAuth')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/signout')
  async signout(
    @CurrentUserId() userid: number,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<IApiResponse<never>> {
    res.cookie('refreshToken', '', {
      expires: new Date(0),
      httpOnly: true,
    });
    await this.authService.signOut(userid);

    return {
      success: true,
      message: 'Successfully Logged Out!',
    };
  }

  // refresh tokens
  @Public() // override global jwt guard first, otherwise it will give error for expired accessToken
  @UseGuards(RefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  async refreshTokens(
    @CurrentUser() user: IRefreshJwtPayload,
    @Response({ passthrough: true }) res: ExpressResponse, // pass http only cookie with response
  ): Promise<IApiResponse<IAccessToken>> {
    const tokens = await this.authService.refreshTokens(
      user?.sub,
      user?.refreshToken,
    );

    if (!tokens) throw new ForbiddenException('Access Denied!');

    this.authService?.storeTokenInCookie(res, tokens?.refreshToken); // update refreshToken as httponly cookie and set it in response

    const response = {
      success: true,
      message: 'Refresh Token Rotation Successful!',
      data: {
        accessToken: tokens?.accessToken, // send new accessToken with response
      },
    };
    return response;
  }

  // google sign in
  @Public() // override global jwt guard first, otherwise it will give error for expired accessToken
  @HttpCode(HttpStatus.OK)
  @Get('/google/signin')
  @UseGuards(GoogleOauthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async auth() {}

  // google sign in
  @Public() // override global jwt guard first, otherwise it will give error for expired accessToken
  @HttpCode(HttpStatus.OK)
  @Get('/google/callback') // shuold be same as redirect url set in google dev console (here, http://localhost:5000/api/auth/google/redirect)
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(
    @Request() req: ExpressRequest,
    @Response({ passthrough: true }) res: ExpressResponse, // pass http only cookie with response
  ): Promise<IApiResponse<IAccessToken>> {
    const tokens = await this.authService.signInGoogle(req?.user);

    if (!tokens) throw new ForbiddenException('Access Denied!');

    this.authService?.storeTokenInCookie(res, tokens?.refreshToken); // store refreshToken as httponly cookie and set it in response

    const response = {
      success: true,
      message: 'User Sign In Successful!',
      data: {
        accessToken: tokens?.accessToken, // send accessToken with response
      },
    };
    return response;
  }
}
