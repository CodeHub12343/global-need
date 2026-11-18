import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { CAUSE_STATUSES } from './types';

const CauseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    publicId: { type: String, unique: true, sparse: true, index: true },
    shortDescription: { type: String, default: '' },
    story: { type: String, default: '' },
    need: { type: String, default: '' },
    whoItSupports: { type: String, default: '' },
    intendedUse: { type: String, default: '' },
    whyNow: { type: String, default: '' },
    primaryAssistance: { type: String, default: '' },
    timeline: { type: String, default: '' },

    category: { type: String, required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    submittedById: { type: Schema.Types.ObjectId, ref: 'User', index: true },

    country: { type: String },
    city: { type: String },
    location: { type: String },

    gradient: { type: String, default: 'linear-gradient(135deg,#0F766E,#115E59)' },

    status: { type: String, enum: CAUSE_STATUSES, default: 'draft', index: true },
    featured: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    submittedAt: { type: Date },
    lastUpdatedAt: { type: Date, default: Date.now },

    assignedReviewerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    reviewerFeedback: { type: String },
    decisionReason: { type: String },

    supportingDocumentIds: { type: [Schema.Types.ObjectId], ref: 'Document', default: [] },

    views: { type: Number, default: 0 },
    inquiriesCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

CauseSchema.index({ status: 1, publishedAt: -1 });
CauseSchema.index({ featured: 1, status: 1 });
CauseSchema.index({ category: 1, status: 1 });

export type CauseDoc = InferSchemaType<typeof CauseSchema> & { _id: Schema.Types.ObjectId };

export const Cause: Model<CauseDoc> =
  (models.Cause as Model<CauseDoc>) ?? model<CauseDoc>('Cause', CauseSchema);
