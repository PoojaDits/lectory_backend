import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole, SellerStatus } from '../common/enums';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  
  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ select: false })
  otpCode?: string; 

  @Prop()
  otpExpiresAt?: Date;

  
  @Prop({ select: false })
  refreshTokenHash?: string;

  // Customer 
  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  // Seller
  @Prop()
  businessName?: string;

  @Prop()
  contactPerson?: string;

  @Prop({ trim: true })
  mobileNumber?: string;

  @Prop({ enum: SellerStatus, type: String })
  sellerStatus?: SellerStatus;

  @Prop()
  rejectionReason?: string;

  @Prop()
  approvedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Clean JSON output: strip secrets
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.otpCode;
    delete ret.refreshTokenHash;
    return ret;
  },
});
