import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { INQUIRY_STATUSES, INQUIRY_TYPES } from './types';

const MessageSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String, required: true },
    senderRole: { type: String, default: 'public' },
    body: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: true },
);

const InquirySchema = new Schema(
  {
    fromName: { type: String, required: true, trim: true },
    fromEmail: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },

    type: { type: String, enum: INQUIRY_TYPES, default: 'general', index: true },
    scope: { type: String, enum: ['general', 'cause', 'organization'], default: 'general', index: true },

    causeId: { type: Schema.Types.ObjectId, ref: 'Cause', index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },

    subject: { type: String, required: true, trim: true },
    initialBody: { type: String, required: true },

    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    status: { type: String, enum: INQUIRY_STATUSES, default: 'new', index: true },

    messages: { type: [MessageSchema], default: [] },
    tags: { type: [String], default: [] },

    unreadForOrg: { type: Boolean, default: true },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

InquirySchema.index({ status: 1, createdAt: -1 });

export type InquiryDoc = InferSchemaType<typeof InquirySchema> & { _id: Schema.Types.ObjectId };

export const Inquiry: Model<InquiryDoc> =
  (models.Inquiry as Model<InquiryDoc>) ?? model<InquiryDoc>('Inquiry', InquirySchema);
