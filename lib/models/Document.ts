import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { DOC_TYPES } from './types';

const DocumentSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    causeId: { type: Schema.Types.ObjectId, ref: 'Cause', index: true },
    uploadedById: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    storageKey: { type: String },
    url: { type: String },

    type: { type: String, enum: DOC_TYPES, default: 'other', index: true },
    isPrivate: { type: Boolean, default: true, index: true },
    consentLogAttached: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type DocumentDoc = InferSchemaType<typeof DocumentSchema> & { _id: Schema.Types.ObjectId };

export const DocumentFile: Model<DocumentDoc> =
  (models.DocumentFile as Model<DocumentDoc>) ??
  model<DocumentDoc>('DocumentFile', DocumentSchema);
