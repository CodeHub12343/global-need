import { z } from 'zod';
import { INQUIRY_TYPES } from '@/lib/models/types';

export const publicInquirySchema = z.object({
  name: z.string().min(2, 'Name is required').max(120),
  email: z.string().email('Enter a valid email').max(180),
  phone: z.string().max(40).optional().or(z.literal('')),
  type: z.enum(INQUIRY_TYPES).default('info'),
  subject: z.string().min(2).max(200).optional(),
  message: z.string().min(5, 'Message is too short').max(5000),
  scope: z.enum(['general', 'cause', 'organization']).default('general'),
  causeSlug: z.string().max(200).optional(),
  organizationSlug: z.string().max(200).optional(),
});

export type PublicInquiryInput = z.infer<typeof publicInquirySchema>;
