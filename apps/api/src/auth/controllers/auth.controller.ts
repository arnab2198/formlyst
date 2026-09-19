import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { Profile } from 'passport-google-oauth20';
import { ConfigService } from '../../config/config.service.js';
import { Validate } from '../../common/decorators/validate.decorator.js';
import { ClientInfo } from '../decorators/client-info.decorator.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { RegistrationToken } from '../decorators/registration-token.decorator.js';
import { RefreshToken } from '../decorators/refresh-token.decorator.js';
import { SkipInternalKeyCheck } from '../decorators/skip-internal-key-check.decorator.js';
import type { AuthenticatedRequest } from '../guards/access-token.guard.js';
import { AccessTokenGuard } from '../guards/access-token.guard.js';
import { GoogleAuthGuard } from '../guards/google-auth.guard.js';
import { RefreshTokenGuard } from '../guards/refresh-token.guard.js';
import { RegistrationTokenGuard } from '../guards/registration-token.guard.js';
import type { SessionMeta } from '../services/session-store.service.js';
import { AuthService } from '../services/auth.service.js';
import {
  handoffExchangeSchema,
  passwordForgotSchema,
  passwordResetSchema,
  setPasswordSchema,
  signinSchema,
  signupCompleteProfileSchema,
  signupResendOtpSchema,
  signupStartSchema,
  signupVerifyOtpSchema,
} from '../schemas/auth.schemas.js';
import type {
  HandoffExchangeDto,
  PasswordForgotDto,
  PasswordResetDto,
  SetPasswordDto,
  SigninDto,
  SignupCompleteProfileDto,
  SignupResendOtpDto,
  SignupStartDto,
  SignupVerifyOtpDto,
} from '../schemas/auth.schemas.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // -- Signup --------------------------------------------------------

  @Post('signup/start')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Validate({ source: 'body', schema: signupStartSchema })
  signupStart(@Body() body: SignupStartDto, @Ip() ip: string) {
    return this.authService.signupStart(body.email, ip);
  }

  @Post('signup/resend-otp')
  @Validate({ source: 'body', schema: signupResendOtpSchema })
  signupResendOtp(@Body() body: SignupResendOtpDto, @Ip() ip: string) {
    return this.authService.signupResendOtp(body.email, ip);
  }

  @Post('signup/verify-otp')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Validate({ source: 'body', schema: signupVerifyOtpSchema })
  signupVerifyOtp(@Body() body: SignupVerifyOtpDto) {
    return this.authService.signupVerifyOtp(body.email, body.code);
  }

  @Post('signup/complete-profile')
  @UseGuards(RegistrationTokenGuard)
  @Validate({ source: 'body', schema: signupCompleteProfileSchema })
  signupCompleteProfile(
    @RegistrationToken() registrationToken: string,
    @Body() body: SignupCompleteProfileDto,
    @ClientInfo() meta: SessionMeta,
  ) {
    return this.authService.signupCompleteProfile(
      registrationToken,
      body,
      meta,
    );
  }

  // -- Signin / signout / refresh ------------------------------------

  @Post('signin')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Validate({ source: 'body', schema: signinSchema })
  signin(@Body() body: SigninDto, @ClientInfo() meta: SessionMeta) {
    return this.authService.signin(body.email, body.password, meta);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  signOut(@CurrentUser() auth: AuthenticatedRequest['auth']) {
    return this.authService.signOut(
      auth.accessToken,
      auth.sessionId,
      auth.userId,
    );
  }

  @Post('signout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  signOutAll(@CurrentUser() auth: AuthenticatedRequest['auth']) {
    return this.authService.signOutAll(auth.userId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @UseGuards(RefreshTokenGuard)
  refresh(@RefreshToken() refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  // -- Registration status --------------------------------------------

  @Get('registration/status')
  registrationStatus(@Req() request: Request) {
    const header = request.headers.authorization;
    const accessToken = header?.startsWith('Bearer ')
      ? header.slice('Bearer '.length).trim()
      : undefined;
    const registrationToken = request.headers['x-registration-token'];

    return this.authService.registrationStatus(
      accessToken,
      typeof registrationToken === 'string' ? registrationToken : undefined,
    );
  }

  // -- Password ---------------------------------------------------------

  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  @Validate({ source: 'body', schema: passwordForgotSchema })
  passwordForgot(@Body() body: PasswordForgotDto, @Ip() ip: string) {
    return this.authService.passwordForgot(body.email, ip);
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @Validate({ source: 'body', schema: passwordResetSchema })
  passwordReset(@Body() body: PasswordResetDto) {
    return this.authService.passwordReset(body.token, body.newPassword);
  }

  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Validate({ source: 'body', schema: setPasswordSchema })
  setPassword(
    @CurrentUser() auth: AuthenticatedRequest['auth'],
    @Body() body: SetPasswordDto,
  ) {
    return this.authService.setPassword(auth.userId, body.password);
  }

  // -- Google OAuth -----------------------------------------------------

  @Get('google')
  @SkipInternalKeyCheck()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseGuards(GoogleAuthGuard)
  initiateGoogle() {
    // never runs — GoogleAuthGuard performs the redirect to Google
  }

  @Get('google/callback')
  @SkipInternalKeyCheck()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() request: Request,
    @Res() response: Response,
    @ClientInfo() meta: SessionMeta,
  ) {
    const clientUrl = this.configService.app.clientUrl;
    const state = await this.authService.consumeOAuthState(
      request.query.state as string,
    );
    if (!state) {
      return response.redirect(`${clientUrl}/signin?googleError=state_expired`);
    }

    const outcome = await this.authService.handleProfile(
      request.user as Profile,
      state,
      meta,
    );

    if (outcome.type === 'auth') {
      return response.redirect(
        `${clientUrl}/api/auth/google/callback?handoff=${outcome.handoffCode}`,
      );
    }

    const qs = outcome.ok ? 'linked=google' : `linkError=${outcome.errorCode}`;
    return response.redirect(`${clientUrl}/account/settings?${qs}`);
  }

  @Post('google/link-intent')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @UseGuards(AccessTokenGuard)
  createLinkIntent(@CurrentUser() auth: AuthenticatedRequest['auth']) {
    return this.authService.createLinkIntent(auth.userId);
  }

  @Post('google/handoff/exchange')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Validate({ source: 'body', schema: handoffExchangeSchema })
  exchangeHandoff(@Body() body: HandoffExchangeDto) {
    return this.authService.exchangeHandoff(body.code);
  }
}
