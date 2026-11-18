export type CauseStatus =
  | 'draft'
  | 'pending'
  | 'changes'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type UpdateStatus = 'draft' | 'submitted' | 'pending' | 'changes' | 'approved' | 'rejected';

export type Category =
  | 'orphanages'
  | 'foster-care'
  | 'cancer'
  | 'diabetes'
  | 'mental-health'
  | 'veterans'
  | 'other';

export const CATEGORIES: { slug: Category; name: string }[] = [
  { slug: 'orphanages', name: 'Orphanages' },
  { slug: 'foster-care', name: 'Foster Care' },
  { slug: 'cancer', name: 'Cancer' },
  { slug: 'diabetes', name: 'Diabetes' },
  { slug: 'mental-health', name: 'Mental Health' },
  { slug: 'veterans', name: 'Veterans' },
  { slug: 'other', name: 'Other Humanitarian Needs' },
];

export const CATEGORY_LABEL: Record<Category, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.name]),
) as Record<Category, string>;

export type Organization = {
  slug: string;
  name: string;
  initial: string;
  category: Category;
  location: string;
  description: string;
  verified: boolean;
  gradient: string;
};


export type Cause = {
  slug: string;
  id: string;
  title: string;
  category: Category;
  organization: Organization;
  shortDescription: string;
  story: string;
  need: string;
  intendedUse: string;
  location: string;
  featured?: boolean;
  status: CauseStatus;
  publishedAt: string;
  lastUpdatedAt: string;
  gradient: string;
};


export const STATUS_LABEL: Record<CauseStatus, string> = {
  draft: 'Draft',
  pending: 'Pending Review',
  changes: 'Changes Requested',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
};
