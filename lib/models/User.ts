import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { USER_ROLES, USER_STATUSES } from './types';

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: 'supporter', index: true },
    status: { type: String, enum: USER_STATUSES, default: 'pending', index: true },
    country: { type: String },
    phone: { type: String },
    avatarUrl: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    emailVerified: { type: Boolean, default: false },
    verificationCode: { type: String, select: false },
    verificationCodeExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    lastSignInAt: { type: Date },
    reviewerCapabilities: { type: [String], default: [] },
    workloadCapacity: { type: Number, default: 6 },
  },
  { timestamps: true },
);

UserSchema.index({ role: 1, status: 1 });

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: Schema.Types.ObjectId };

export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) ?? model<UserDoc>('User', UserSchema);
