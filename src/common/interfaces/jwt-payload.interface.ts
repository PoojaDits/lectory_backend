import { UserRole } from '../enums';

export interface JwtPayload {
  sub: string;      // userId
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}