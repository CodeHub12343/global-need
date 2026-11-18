import { z } from 'zod';
import { INQUIRY_STATUSES, INQUIRY_TYPES, DOC_TYPES } from '@/lib/models/types';

export const causeBasicSchema = z.object({
  title: z.string().min(2).max(160),
  category: z.string().min(2).max(60),
  shortDescription: z.string().max(400).optional().or(z.literal('')),
  story: z.string().max(5000).optional().or(z.literal('')),
  country: z.string().max(80).optional().or(z.literal('')),
  city: z.string().max(80).optional().or(z.literal('')),
});

export const causeFullSchema = causeBasicSchema.extend({
  need: z.string().max(5000).optional().or(z.literal('')),
  whoItSupports: z.string().max(2000).optional().or(z.literal('')),
  intendedUse: z.string().max(2000).optional().or(z.literal('')),
  whyNow: z.string().max(2000).optional().or(z.literal('')),
  primaryAssistance: z.string().max(120).optional().or(z.literal('')),
  timeline: z.string().max(80).optional().or(z.literal('')),
  gradient: z.string().max(200).optional(),
});

export const updateDraftSchema = z.object({
  causeId: z.string().min(1),
  title: z.string().min(2).max(160),
  body: z.string().max(5000).optional().or(z.literal('')),
  consentLogAttached: z.boolean().optional(),
});

export const inquiryPatchSchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  assigneeId: z.string().nullable().optional(),
  tags: z.array(z.string().max(40)).optional(),
  markRead: z.boolean().optional(),
});

export const inquiryReplySchema = z.object({
  body: z.string().min(1).max(5000),
});

export const orgUpdateSchema = z.object({
  name: z.string().min(2).max(160).optional(),
  type: z.string().max(80).optional(),
  shortDescription: z.string().max(400).optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),
  category: z.string().max(60).optional(),
  country: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  operatingSince: z.string().max(40).optional(),
  publicEmail: z.string().email().max(180).optional().or(z.literal('')),
  publicPhone: z.string().max(60).optional().or(z.literal('')),
  website: z.string().max(300).optional().or(z.literal('')),
  socialLinks: z.array(z.string().max(300)).optional(),
  gradient: z.string().max(200).optional(),
});

export const inviteSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  role: z.enum(['representative', 'org_admin']).default('representative'),
});

export const teamPatchSchema = z.object({
  role: z.enum(['representative', 'org_admin']).optional(),
});

export const docCreateSchema = z.object({
  filename: z.string().min(1).max(260),
  originalName: z.string().min(1).max(260),
  size: z.number().int().positive().max(20 * 1024 * 1024),
  mimeType: z.string().min(1).max(160),
  storageKey: z.string().max(260).optional(),
  url: z.string().max(600).optional(),
  type: z.enum(DOC_TYPES).default('other'),
  causeId: z.string().optional(),
  consentLogAttached: z.boolean().optional(),
});

export const accountUpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().max(60).optional().or(z.literal('')),
  country: z.string().max(80).optional().or(z.literal('')),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(/[A-Z]/, 'Needs an uppercase letter')
    .regex(/[a-z]/, 'Needs a lowercase letter')
    .regex(/[0-9]/, 'Needs a number'),
});

export { INQUIRY_TYPES };
