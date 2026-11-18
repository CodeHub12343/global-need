import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'heart' },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
    createdById: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export type CategoryDoc = InferSchemaType<typeof CategorySchema> & { _id: Schema.Types.ObjectId };

export const Category: Model<CategoryDoc> =
  (models.Category as Model<CategoryDoc>) ?? model<CategoryDoc>('Category', CategorySchema);
