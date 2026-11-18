import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

// Append-only. We intentionally do not add update/delete helpers.
const AuditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String },
    actorRole: { type: String },

    action: { type: String, required: true, index: true },
    label: { type: String, required: true },

    subjectType: { type: String, index: true },
    subjectId: { type: Schema.Types.ObjectId, index: true },
    subjectDescription: { type: String },

    ip: { type: String },
    userAgent: { type: String },
    sessionId: { type: String },

    metadata: { type: Schema.Types.Mixed },

    createdAt: { type: Date, default: Date.now, immutable: true, index: true },
  },
  { minimize: false, timestamps: false },
);

export type AuditLogDoc = InferSchemaType<typeof AuditLogSchema> & { _id: Schema.Types.ObjectId };

export const AuditLog: Model<AuditLogDoc> =
  (models.AuditLog as Model<AuditLogDoc>) ?? model<AuditLogDoc>('AuditLog', AuditLogSchema);

export async function logAudit(entry: Partial<AuditLogDoc> & { action: string; label: string }) {
  try {
    await AuditLog.create(entry);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[audit] failed', err);
  }
}
