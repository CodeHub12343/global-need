import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const PlatformSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed },
    group: { type: String, default: 'general' },
    updatedById: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export type PlatformSettingDoc = InferSchemaType<typeof PlatformSettingSchema> & { _id: Schema.Types.ObjectId };

export const PlatformSetting: Model<PlatformSettingDoc> =
  (models.PlatformSetting as Model<PlatformSettingDoc>) ??
  model<PlatformSettingDoc>('PlatformSetting', PlatformSettingSchema);

export const DEFAULT_SETTINGS: Record<string, unknown> = {
  'general.platformName': 'Meeting Global Needs',
  'general.supportEmail': 'support@meetingglobalneeds.sample',
  'general.language': 'en-US',
  'general.timezone': 'UTC',
  'submissions.autoAssignReviewers': true,
  'submissions.slaDays': 3,
  'submissions.allowDraftExpire': true,
  'submissions.draftExpireDays': 90,
  'submissions.requireSecondReviewerFor': ['reject', 'suspend'],
  'notifications.rep.submissionReceived': true,
  'notifications.rep.decision': true,
  'notifications.rep.newInquiry': true,
  'notifications.rep.weeklyDigest': false,
  'notifications.reviewer.newAssignment': true,
  'notifications.reviewer.reassignment': true,
  'notifications.reviewer.dailySummary': true,
  'privacy.documentRetentionDays': 365,
  'privacy.enforceBeneficiaryPrivacy': true,
  'privacy.exportAccess': 'super_admins_only',
};
