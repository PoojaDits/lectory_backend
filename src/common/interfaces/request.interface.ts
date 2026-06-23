import { Request } from 'express';
import { AuthUser } from './jwt-payload.interface';

export interface RequestWithUser extends Request {
  user: AuthUser;
}