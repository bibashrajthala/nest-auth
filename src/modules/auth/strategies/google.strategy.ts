import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { Provider } from 'src/modules/users/types/user.types';
import { CreateUserDto } from 'src/modules/users/dtos/create-user.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, given_name, family_name, emails, picture } = profile;

    // console.log(profile);

    const user = {
      provider: Provider?.GOOGLE,
      providerId: id,
      email: emails[0].value,
      // name: `${name.givenName} ${name.familyName}`,
      firstName: given_name,
      lastName: family_name,
      profilePicture: picture ?? null,

      role: 'user',
    };

    done(null, user);
  }
}
