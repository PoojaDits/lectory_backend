import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/users.schema';
import { RegisterDto, VerifyOtpDto } from './dto';
import { UserRole, SellerStatus } from '../common/enums';
import { AUTH_MESSAGES, OTP_MESSAGES, USER_MESSAGES } from '../common/constants';
import {
  JwtPayload,
  RegisterResponse,
  LoginResponse,
  RefreshResponse,
} from '../common/interfaces';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  private generateOtp(): string {
    // 6-digit code: 100000 - 999999
    return crypto.randomInt(100000, 999999).toString();
  }

  private async signTokens(payload: JwtPayload) {
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: (this.config.get('JWT_REFRESH_EXPIRES_IN') ?? '7d') as any,
    });
    return { access_token, refresh_token };
  }

  // --- REGISTER ---
  async register(dto: RegisterDto): Promise<RegisterResponse> {
    // Build user doc based on role
    const userData: any = {
      email: dto.email,
      role: dto.role,
      isEmailVerified: false,
    };

    if (dto.role === UserRole.CUSTOMER) {
      userData.firstName = dto.firstName;
      userData.lastName = dto.lastName;
    } else if (dto.role === UserRole.SELLER) {
      userData.businessName = dto.businessName;
      userData.contactPerson = dto.contactPerson;
      userData.mobileNumber = dto.mobileNumber;
      userData.sellerStatus = SellerStatus.PENDING;
    }

    const user = await this.usersService.createUser(userData, dto.password);

    // Send OTP via email
    await this.sendOtp(user.id, user.email, user.role, user.firstName || user.contactPerson);

    return {
      message: OTP_MESSAGES.SENT,
      userId: user.id,
      email: user.email,
      role: user.role,
      sellerStatus: user.sellerStatus,
    };
  }

  // --- OTP ---
  async sendOtp(userId: string, email?: string, role?: UserRole, name?: string) {
    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const minutes = Number(this.config.get('OTP_EXPIRE_MINUTES', 5));
    const expiresAt = new Date(Date.now() + minutes * 60000);

    await this.usersService.setOtp(userId, otpHash, expiresAt);

    // Always log in dev – helps if SMTP fails
    this.logger.log(`OTP for user ${userId} (${email}): ${otp} (expires ${minutes}m)`);

    // Send real email if we have an email address
    if (email) {
      await this.mailService.sendOtpEmail(email, otp, name, role);
    }
    return true;
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException(OTP_MESSAGES.INVALID);
    }
    if (user.otpExpiresAt < new Date()) {
      throw new BadRequestException(OTP_MESSAGES.INVALID);
    }
    if (user.isEmailVerified) {
      throw new BadRequestException(OTP_MESSAGES.ALREADY_VERIFIED);
    }

    const ok = await bcrypt.compare(dto.otp, user.otpCode);
    if (!ok) throw new BadRequestException(OTP_MESSAGES.INVALID);

    await this.usersService.markEmailVerified(user.id);
    return { message: OTP_MESSAGES.VERIFIED };
  }

  async resendOtp(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException(USER_MESSAGES.USER_NOT_FOUND);
    if (user.isEmailVerified) throw new BadRequestException(OTP_MESSAGES.ALREADY_VERIFIED);

    await this.sendOtp(
      user.id,
      user.email,
      user.role,
      user.firstName || user.contactPerson,
    );
    return { message: OTP_MESSAGES.RESENT };
  }

  // --- LOGIN (called by LocalStrategy) ---
  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(email, true);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
    if (!user.isEmailVerified) {
      throw new ForbiddenException(OTP_MESSAGES.NOT_VERIFIED);
    }
    if (
      user.role === UserRole.SELLER &&
      user.sellerStatus !== SellerStatus.APPROVED
    ) {
      throw new ForbiddenException(AUTH_MESSAGES.SELLER_PENDING);
    }
    return user;
  }

  async login(user: UserDocument): Promise<LoginResponse> {
    // user.id = string (Mongoose virtual)
    // user._id = ObjectId
    const userId = user.id;

    const payload: JwtPayload = {
      sub: userId,
      email: user.email,
      role: user.role,
    };

    const tokens = await this.signTokens(payload);
    const refreshHash = await bcrypt.hash(tokens.refresh_token, 10);
    await this.usersService.setRefreshToken(userId, refreshHash);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: userId,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName,
      },
    };
  }

  // --- REFRESH ---
  async refresh(userId: string, refreshToken: string): Promise<RefreshResponse> {
    const user = await this.usersService.findById(userId, true);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException(AUTH_MESSAGES.UNAUTHORIZED);
    }

    const ok = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!ok) throw new UnauthorizedException(AUTH_MESSAGES.UNAUTHORIZED);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = await this.signTokens(payload);
    await this.usersService.setRefreshToken(
      user.id,
      await bcrypt.hash(tokens.refresh_token, 10),
    );
    return tokens;
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.setRefreshToken(userId, null);
    return { message: AUTH_MESSAGES.LOGOUT_SUCCESS };
  }
}
