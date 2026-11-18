import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const SubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    status: { type: String, enum: ['active', 'unsubscribed'], default: 'active', index: true },
    source: { type: String, default: 'landing' },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true },
);

export type SubscriberDoc = InferSchemaType<typeof SubscriberSchema> & { _id: Schema.Types.ObjectId };

export const Subscriber: Model<SubscriberDoc> =
  (models.Subscriber as Model<SubscriberDoc>) ?? model<SubscriberDoc>('Subscriber', SubscriberSchema);
