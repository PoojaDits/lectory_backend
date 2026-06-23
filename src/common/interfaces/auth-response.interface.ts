import { UserRole, SellerStatus } from '../enums';

export interface RegisterResponse {
  message: string;
  userId: string;
  email: string;
  role: UserRole;
  sellerStatus?: SellerStatus;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    businessName?: string;
  };
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}