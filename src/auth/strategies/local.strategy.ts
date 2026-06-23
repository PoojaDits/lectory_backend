import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UserDocument } from '../../users/users.schema';

/**
 * passport-local strategy
 * Used by POST /auth/login
 * Validates email + password, checks OTP verified + seller approval
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // passport-local defaults to "username", we use "email"
  }

  async validate(email: string, password: string): Promise<UserDocument> {
    // AuthService.validateUser throws if:
    // - wrong password
    // - email not verified
    // - seller not approved
    return this.authService.validateUser(email, password);
  }
}
