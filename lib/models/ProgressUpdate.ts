import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { UPDATE_STATUSES } from './types';

const ProgressUpdateSchema = new Schema(
  {
    causeId: { type: Schema.Types.ObjectId, ref: 'Cause', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    title: { type: String, required: true, trim: true },
    body: { type: String, default: '' },
    media: { type: [Schema.Types.ObjectId], ref: 'Document', default: [] },
    consentLogAttached: { type: Boolean, default: false },

    status: { type: String, enum: UPDATE_STATUSES, default: 'draft', index: true },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    approvedById: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewerFeedback: { type: String },
    assignedReviewerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },

    views: { type: Number, default: 0 },
    flagged: { type: Boolean, default: false },
    flagReason: { type: String },
  },
  { timestamps: true },
);

ProgressUpdateSchema.index({ status: 1, createdAt: -1 });

export type ProgressUpdateDoc = InferSchemaType<typeof ProgressUpdateSchema> & { _id: Schema.Types.ObjectId };

export const ProgressUpdate: Model<ProgressUpdateDoc> =
  (models.ProgressUpdate as Model<ProgressUpdateDoc>) ??
  model<ProgressUpdateDoc>('ProgressUpdate', ProgressUpdateSchema);
