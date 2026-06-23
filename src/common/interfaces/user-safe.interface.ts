import { UserRole, SellerStatus } from '../enums';

export interface UserSafe {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  contactPerson?: string;
  mobileNumber?: string;
  sellerStatus?: SellerStatus;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
