export const AUTH_MESSAGES = {
  REGISTER_SUCCESS_CUSTOMER: 'Customer registered successfully',
  REGISTER_SUCCESS_SELLER: 'Seller registration submitted. Pending admin approval.',
  LOGIN_SUCCESS: 'Login successful',
  INVALID_CREDENTIALS: 'Invalid email or password',
  SELLER_PENDING: 'Seller account pending approval',
  SELLER_REJECTED: 'Seller account has been rejected',
  UNAUTHORIZED: 'Unauthorized',
  TOKEN_EXPIRED: 'Token expired',
  LOGOUT_SUCCESS: 'Logged out successfully',
} as const;

export const USER_MESSAGES = {
  EMAIL_EXISTS: 'Email already registered',
  MOBILE_EXISTS: 'Mobile number already registered',
  USER_NOT_FOUND: 'User not found',
  USER_CREATED: 'User created successfully',
  PROFILE_FETCHED: 'Profile fetched successfully',
} as const;

export const SELLER_MESSAGES = {
  APPROVED: 'Seller approved successfully',
  REJECTED: 'Seller rejected',
  PENDING_LIST: 'Pending sellers fetched',
  NOT_PENDING: 'Seller is not in pending state',
} as const;

export const OTP_MESSAGES = {
  SENT: 'OTP sent to your email',
  VERIFIED: 'Email verified successfully',
  INVALID: 'Invalid or expired OTP',
  RESENT: 'OTP resent successfully',
  NOT_VERIFIED: 'Please verify your email first',
  ALREADY_VERIFIED: 'Email already verified',
} as const;

export const VALIDATION_MESSAGES = {
  EMAIL_INVALID: 'Please provide a valid email',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_MIN: 'Password must be at least 8 characters',
  PASSWORD_REQUIRED: 'Password is required',
  FIRST_NAME_REQUIRED: 'First name is required',
  LAST_NAME_REQUIRED: 'Last name is required',
  BUSINESS_NAME_REQUIRED: 'Business name is required',
  CONTACT_PERSON_REQUIRED: 'Contact person is required',
  MOBILE_INVALID: 'Please provide a valid Indian mobile number',
  ROLE_INVALID: 'Role must be customer, seller, or admin',
  OTP_REQUIRED: 'OTP is required',
  OTP_LENGTH: 'OTP must be 6 digits',
} as const;
