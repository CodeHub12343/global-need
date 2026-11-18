import { z } from 'zod';

const checklistItem = z.object({
  key: z.string().max(60),
  label: z.string().max(200),
  checked: z.boolean().default(false),
});

export const causeDecisionSchema = z
  .object({
    action: z.enum(['approve', 'changes', 'reject']),
    reason: z.string().max(5000).optional().or(z.literal('')),
    internalNotes: z.string().max(5000).optional().or(z.literal('')),
    checklist: z.array(checklistItem).optional(),
  })
  .refine((v) => v.action === 'approve' || (v.reason && v.reason.trim().length >= 4), {
    message: 'A reason is required for changes or rejection',
    path: ['reason'],
  });

export const updateDecisionSchema = causeDecisionSchema;

export const assignSchema = z.object({
  reviewerId: z.string().nullable().optional(),
});

export const orgDecisionSchema = z
  .object({
    action: z.enum(['verify', 'reject', 'suspend']),
    reason: z.string().max(5000).optional().or(z.literal('')),
    checksPassed: z.number().int().min(0).max(3).optional(),
  })
  .refine((v) => v.action === 'verify' || (v.reason && v.reason.trim().length >= 4), {
    message: 'A reason is required for reject or suspend',
    path: ['reason'],
  });
