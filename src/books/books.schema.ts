import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { BookStatus } from '../common/enums';

export type BookDocument = HydratedDocument<Book>;

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true, unique: true, trim: true })
  isbn: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  author: string;

  @Prop({ trim: true })
  publisher?: string;

  @Prop()
  description?: string;

  @Prop()
  coverImage?: string;

  @Prop({ required: true, enum: BookStatus, default: BookStatus.PENDING })
  status: BookStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBySellerId?: string;

  @Prop()
  reviewedAt?: Date;

  @Prop([String])
  categories?: string[];

  @Prop({ default: 0 })
  rating?: number;

  @Prop()
  pageCount?: number;

  @Prop()
  publishedDate?: string;

  @Prop()
  language?: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);

// Ensure clean JSON output for frontend compatibility (converts _id to id)
BookSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    (ret as any).id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
