import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';
import { ConfigService } from '../../config/config.service.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const { google } = configService.auth;
    super({
      clientID: google.clientId || 'not-configured',
      clientSecret: google.clientSecret || 'not-configured',
      callbackURL:
        google.callbackUrl || 'http://localhost:8000/auth/google/callback',
      scope: ['profile', 'email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Profile {
    return profile;
  }
}
