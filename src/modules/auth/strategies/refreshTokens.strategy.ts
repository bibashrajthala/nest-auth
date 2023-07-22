import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Request as RequestType } from 'express';
import { IJwtPayload } from '../auth.service';

export interface IRefreshJwtPayload extends IJwtPayload {
  refreshToken: string;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshTokenStrategy.extractRefreshJwtTokenFromHttpOnlyCookies,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: RequestType, payload: IRefreshJwtPayload) {
    const refreshToken =
      RefreshTokenStrategy.extractRefreshJwtTokenFromHttpOnlyCookies(req);

    // console.log('refrr', refreshToken);

    if (!refreshToken) throw new ForbiddenException('Access Denied!');

    return { ...payload, refreshToken };
  }

  private static extractRefreshJwtTokenFromHttpOnlyCookies(
    req: RequestType,
  ): string | null {
    // cookies will be a string containing all the cookies sent with the request
    const cookies = req?.headers?.cookie;
    // console.log('cookies', cookies);

    if (!cookies) return null;

    // parse the cookies string into an object if needed
    const parsedCookies = RefreshTokenStrategy.parseCookies(cookies);
    // console.log('parsedCookies', parsedCookies);

    // Access specific cookie values
    const refreshToken = parsedCookies['refreshToken'];
    // console.log('refreshToken', refreshToken);

    // Do something with the cookie value or return it
    return refreshToken ? refreshToken : null;
  }

  private static parseCookies(cookieString: string): any {
    const cookies = {};
    cookieString.split(';').forEach((cookie) => {
      const [key, value] = cookie.split('=');
      cookies[key.trim()] = value.trim();
    });
    return cookies;
  }
}
