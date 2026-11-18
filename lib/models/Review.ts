import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { REVIEW_ACTIONS } from './types';

const ReviewSchema = new Schema(
  {
    subjectType: { type: String, enum: ['cause', 'update', 'organization'], required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, required: true, index: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    action: { type: String, enum: REVIEW_ACTIONS, required: true },
    reason: { type: String, default: '' },
    internalNotes: { type: String, default: '' },
    checklist: {
      type: [
        new Schema({ key: String, label: String, checked: { type: Boolean, default: false } }, { _id: false }),
      ],
      default: [],
    },
  },
  { timestamps: true },
);

ReviewSchema.index({ subjectType: 1, subjectId: 1, createdAt: -1 });

export type ReviewDoc = InferSchemaType<typeof ReviewSchema> & { _id: Schema.Types.ObjectId };

export const Review: Model<ReviewDoc> =
  (models.Review as Model<ReviewDoc>) ?? model<ReviewDoc>('Review', ReviewSchema);
