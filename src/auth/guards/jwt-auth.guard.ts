import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protects routes with JWT access token
 * Use: @UseGuards(JwtAuthGuard)
 * Header: Authorization: Bearer <token>
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
