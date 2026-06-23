import { UserRole, SellerStatus } from '../enums';

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    status?: SellerStatus;
  };
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    businessName?: string;
  };
}