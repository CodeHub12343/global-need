export const USER_ROLES = [
  'supporter',
  'representative',
  'org_admin',
  'reviewer',
  'senior_reviewer',
  'super_admin',
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['active', 'pending', 'suspended'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const ORG_STATUSES = ['pending', 'verified', 'suspended', 'rejected'] as const;
export type OrgStatus = (typeof ORG_STATUSES)[number];

export const CAUSE_STATUSES = ['draft', 'pending', 'changes', 'approved', 'rejected', 'suspended'] as const;
export type CauseStatus = (typeof CAUSE_STATUSES)[number];

export const UPDATE_STATUSES = ['draft', 'pending', 'changes', 'approved', 'rejected'] as const;
export type UpdateStatus = (typeof UPDATE_STATUSES)[number];

export const INQUIRY_STATUSES = ['new', 'waiting', 'resolved', 'flagged'] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_TYPES = ['general', 'volunteer', 'partnership', 'info', 'support', 'other'] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const DOC_TYPES = [
  'registration',
  'governance',
  'operating_budget',
  'reference',
  'photos',
  'consent_log',
  'other',
] as const;
export type DocType = (typeof DOC_TYPES)[number];

export const REVIEW_ACTIONS = ['approve', 'changes', 'reject', 'verify', 'request_info'] as const;
export type ReviewAction = (typeof REVIEW_ACTIONS)[number];
