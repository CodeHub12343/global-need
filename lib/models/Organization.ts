import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { ORG_STATUSES } from './types';

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    type: { type: String, default: 'ngo' },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    category: { type: String, index: true },
    country: { type: String },
    city: { type: String },
    operatingSince: { type: String },
    publicEmail: { type: String },
    publicPhone: { type: String },
    website: { type: String },
    socialLinks: { type: [String], default: [] },
    logo: { type: String },
    gradient: { type: String, default: 'linear-gradient(135deg,#0F766E,#115E59)' },
    initial: { type: String },

    status: { type: String, enum: ORG_STATUSES, default: 'pending', index: true },
    verifiedAt: { type: Date },
    verifiedById: { type: Schema.Types.ObjectId, ref: 'User' },

    adminIds: { type: [Schema.Types.ObjectId], ref: 'User', default: [], index: true },
    memberIds: { type: [Schema.Types.ObjectId], ref: 'User', default: [], index: true },

    checksPassed: { type: Number, default: 0 },
    checksTotal: { type: Number, default: 3 },
  },
  { timestamps: true },
);

OrganizationSchema.index({ status: 1, createdAt: -1 });

export type OrganizationDoc = InferSchemaType<typeof OrganizationSchema> & { _id: Schema.Types.ObjectId };

export const Organization: Model<OrganizationDoc> =
  (models.Organization as Model<OrganizationDoc>) ??
  model<OrganizationDoc>('Organization', OrganizationSchema);
