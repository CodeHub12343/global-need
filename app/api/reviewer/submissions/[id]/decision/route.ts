import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Cause, Review } from '@/lib/models';
import { ok, notFound, fail, parseJSON, withErrors } from '@/lib/api';
import { requireReviewer } from '@/lib/reviewer-auth';
import { causeDecisionSchema } from '@/lib/validation/reviewer';
import { shapeCauseRow } from '@/lib/dashboard-shape';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireReviewer();
    if (user instanceof Response) return user;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Submission not found');
    const input = await parseJSON(req, causeDecisionSchema);
    await connectDB();
    const cause = await Cause.findById(params.id);
    if (!cause) return notFound('Submission not found');
    if (!['pending', 'changes'].includes(cause.status)) {
      return fail('Only pending/changes submissions can receive a decision', 409);
    }

    const now = new Date();
    if (input.action === 'approve') {
      cause.status = 'approved';
      cause.publishedAt = cause.publishedAt || now;
      cause.decisionReason = input.reason || 'Approved';
    } else if (input.action === 'changes') {
      cause.status = 'changes';
      cause.reviewerFeedback = input.reason || '';
    } else {
      cause.status = 'rejected';
      cause.decisionReason = input.reason || '';
    }
    cause.lastUpdatedAt = now;
    await cause.save();

    await Review.create({
      subjectType: 'cause',
      subjectId: cause._id,
      reviewerId: user.id,
      action: input.action,
      reason: input.reason || '',
      internalNotes: input.internalNotes || '',
      checklist: input.checklist || [],
    });

    await logAudit({
      actorId: user.id as any,
      actorName: user.name,
      actorRole: user.role,
      action: `cause.${input.action}`,
      label: `Cause ${input.action}`,
      subjectType: 'cause',
      subjectId: cause._id as any,
      subjectDescription: cause.title,
      metadata: { reason: input.reason || null, organizationId: String(cause.organizationId) },
    });

    return ok(shapeCauseRow(cause.toObject()));
  }) as unknown as NextResponse;
}
