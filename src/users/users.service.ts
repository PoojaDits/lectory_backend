import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './users.schema';
import { USER_MESSAGES } from '../common/constants/messages.constant';
import { SellerStatus } from '../common/enums/seller-status.enum';
import { UserRole } from '../common/enums/user-role.enum';

/**
 * UsersService = pure DB layer.
 * No auth logic, no token signing, no OTP generation.
 * Called by AuthService.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  findByEmail(email: string, withSecrets = false) {
    const q = this.userModel.findOne({ email: email.toLowerCase() });
    return withSecrets
      ? q.select('+password +otpCode +refreshTokenHash').exec()
      : q.exec();
  }

  findById(id: string, withSecrets = false) {
    const q = this.userModel.findById(id);
    return withSecrets
      ? q.select('+password +otpCode +refreshTokenHash').exec()
      : q.exec();
  }

  async createUser(data: Partial<User>, plainPassword: string) {
    const exists = await this.findByEmail(data.email!);
    if (exists) throw new ConflictException(USER_MESSAGES.EMAIL_EXISTS);

    const password = await bcrypt.hash(plainPassword, 12);
    return this.userModel.create({ ...data, password });
  }

  async setOtp(userId: string, otpHash: string, expiresAt: Date) {
    return this.userModel.findByIdAndUpdate(userId, {
      otpCode: otpHash,
      otpExpiresAt: expiresAt,
    }).exec();
  }

  async markEmailVerified(userId: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { isEmailVerified: true, otpCode: null, otpExpiresAt: null },
      { new: true },
    ).exec();
  }

  async setRefreshToken(userId: string, refreshTokenHash: string | null) {
    return this.userModel.findByIdAndUpdate(
      userId, 
      { refreshTokenHash },
    ).exec();
  }

  async approveSeller(id: string) {
    return this.userModel.findByIdAndUpdate(
      id,
      { sellerStatus: SellerStatus.APPROVED, approvedAt: new Date() },
      { new: true },
    ).exec();
  }

  async findPendingSellers() {
    return this.userModel.find({
      role: UserRole.SELLER,
      sellerStatus: SellerStatus.PENDING,
    }).sort({ createdAt: -1 }).exec();
  }
}