import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Triggers LocalStrategy (email + password check)
 * Use: @UseGuards(LocalAuthGuard) on POST /auth/login
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
