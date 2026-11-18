import { z } from 'zod';
import {
  CAUSE_STATUSES,
  INQUIRY_STATUSES,
  ORG_STATUSES,
  USER_ROLES,
  USER_STATUSES,
} from '../models/types';

export const causePatchSchema = z.object({
  title: z.string().min(2).max(140).optional(),
  category: z.string().min(1).optional(),
  shortDescription: z.string().max(500).optional(),
  status: z.enum(CAUSE_STATUSES).optional(),
  featured: z.boolean().optional(),
  assignedReviewerId: z.string().nullable().optional(),
});

export const userPatchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  organizationId: z.string().nullable().optional(),
  reviewerCapabilities: z.array(z.string()).optional(),
  workloadCapacity: z.number().min(1).max(50).optional(),
});

export const userInviteSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().toLowerCase(),
  role: z.enum(USER_ROLES),
  organizationId: z.string().optional(),
  reviewerCapabilities: z.array(z.string()).optional(),
});

export const inquiryPatchSchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  assigneeId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const bulkAssignSchema = z.object({
  ids: z.array(z.string()).min(1),
  kind: z.enum(['cause', 'update', 'inquiry']),
  reviewerId: z.string().nullable(),
});

export const orgPatchSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.enum(ORG_STATUSES).optional(),
  category: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
});

export const orgDecisionSchema = z.object({
  action: z.enum(['verify', 'request_info', 'reject']),
  reason: z.string().optional(),
  internalNotes: z.string().optional(),
  checklist: z.array(z.object({ key: z.string(), label: z.string(), checked: z.boolean() })).optional(),
}).refine((v) => v.action === 'verify' || (v.reason && v.reason.trim().length >= 4), {
  message: 'A reason is required',
  path: ['reason'],
});

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes only'),
  description: z.string().max(240).optional(),
  icon: z.string().max(40).optional(),
  active: z.boolean().optional(),
});

export const categoryPatchSchema = categorySchema.partial();

export const categoryReorderSchema = z.object({
  order: z.array(z.string()).min(1),
});

export const settingsPatchSchema = z.object({
  values: z.record(z.any()),
});
