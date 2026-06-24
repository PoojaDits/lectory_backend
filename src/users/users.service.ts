import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './users.schema';
import { USER_MESSAGES, SELLER_MESSAGES } from '../common/constants/messages.constant';
import { SellerStatus } from '../common/enums/seller-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { QueryUsersDto, UpdateMeDto } from './dto';


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

  async getByIdOrFail(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    return user;
  }

  async createUser(data: Partial<User>, plainPassword: string) {
    const exists = await this.findByEmail(data.email!);
    if (exists) throw new ConflictException(USER_MESSAGES.EMAIL_EXISTS);

    const password = await bcrypt.hash(plainPassword, 12);
    return this.userModel.create({ ...data, password });
  }

  async upsertAdmin(data: Partial<User>, plainPassword: string) {
    const email = data.email!.toLowerCase();
    const password = await bcrypt.hash(plainPassword, 12);

    return this.userModel.findOneAndUpdate(
      { email },
      {
        $set: {
          ...data,
          email,
          role: UserRole.ADMIN,
          password,
          isActive: true,
          isEmailVerified: true,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).exec();
  }

  async findAll(query: QueryUsersDto = {}) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.role) filter.role = query.role;
    if (query.sellerStatus) filter.sellerStatus = query.sellerStatus;
    if (typeof query.isActive === 'boolean') filter.isActive = query.isActive;
    if (typeof query.isEmailVerified === 'boolean') {
      filter.isEmailVerified = query.isEmailVerified;
    }

    if (query.search?.trim()) {
      const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { email: regex },
        { firstName: regex },
        { lastName: regex },
        { businessName: regex },
        { contactPerson: regex },
        { mobileNumber: regex },
      ];
    }

    const [items, total] = await Promise.all([
      this.userModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  findCustomers(query: QueryUsersDto = {}) {
    return this.findAll({ ...query, role: UserRole.CUSTOMER });
  }

  findSellers(query: QueryUsersDto = {}) {
    return this.findAll({ ...query, role: UserRole.SELLER });
  }

  async updateProfile(userId: string, dto: UpdateMeDto) {
    const user = await this.getByIdOrFail(userId);
    const update: Partial<User> = {};

    if (dto.password) {
      update.password = await bcrypt.hash(dto.password, 12);
    }

    if (user.role === UserRole.CUSTOMER) {
      if (dto.firstName !== undefined) update.firstName = dto.firstName;
      if (dto.lastName !== undefined) update.lastName = dto.lastName;
    }

    if (user.role === UserRole.SELLER) {
      if (dto.businessName !== undefined) update.businessName = dto.businessName;
      if (dto.contactPerson !== undefined) update.contactPerson = dto.contactPerson;
      if (dto.mobileNumber !== undefined) update.mobileNumber = dto.mobileNumber;
    }

    return this.userModel.findByIdAndUpdate(userId, update, { new: true }).exec();
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

  async updateActiveStatus(id: string, isActive: boolean) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    ).exec();

    if (!user) throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    return user;
  }

  async approveSeller(id: string) {
    const user = await this.getByIdOrFail(id);
    if (user.role !== UserRole.SELLER) {
      throw new BadRequestException('User is not a seller');
    }

    return this.userModel.findByIdAndUpdate(
      id,
      {
        sellerStatus: SellerStatus.APPROVED,
        rejectionReason: null,
        approvedAt: new Date(),
      },
      { new: true },
    ).exec();
  }

  async rejectSeller(id: string, rejectionReason?: string) {
    const user = await this.getByIdOrFail(id);
    if (user.role !== UserRole.SELLER) {
      throw new BadRequestException('User is not a seller');
    }

    return this.userModel.findByIdAndUpdate(
      id,
      {
        sellerStatus: SellerStatus.REJECTED,
        rejectionReason: rejectionReason || SELLER_MESSAGES.REJECTED,
        approvedAt: null,
      },
      { new: true },
    ).exec();
  }

  async findPendingSellers() {
    return this.userModel.find({
      role: UserRole.SELLER,
      sellerStatus: SellerStatus.PENDING,
    }).sort({ createdAt: -1 }).exec();
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    return user;
  }
}
