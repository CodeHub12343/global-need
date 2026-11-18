import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { ProgressUpdate, Review } from '@/lib/models';
import { ok, notFound, fail, parseJSON, withErrors } from '@/lib/api';
import { requireReviewer } from '@/lib/reviewer-auth';
import { updateDecisionSchema } from '@/lib/validation/reviewer';
import { shapeUpdateRow } from '@/lib/dashboard-shape';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireReviewer();
    if (user instanceof Response) return user;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Update not found');
    const input = await parseJSON(req, updateDecisionSchema);
    await connectDB();
    const upd = await ProgressUpdate.findById(params.id);
    if (!upd) return notFound('Update not found');
    if (!['pending', 'changes'].includes(upd.status)) return fail('Only pending/changes updates can receive a decision', 409);

    const now = new Date();
    if (input.action === 'approve') {
      upd.status = 'approved';
      upd.approvedAt = now;
      upd.approvedById = user.id as any;
    } else if (input.action === 'changes') {
      upd.status = 'changes';
      upd.reviewerFeedback = input.reason || '';
    } else {
      upd.status = 'rejected';
      upd.reviewerFeedback = input.reason || '';
    }
    await upd.save();

    await Review.create({
      subjectType: 'update',
      subjectId: upd._id,
      reviewerId: user.id,
      action: input.action,
      reason: input.reason || '',
      internalNotes: input.internalNotes || '',
    });

    await logAudit({
      actorId: user.id as any,
      actorName: user.name,
      actorRole: user.role,
      action: `update.${input.action}`,
      label: `Update ${input.action}`,
      subjectType: 'update',
      subjectId: upd._id as any,
      subjectDescription: upd.title,
      metadata: { reason: input.reason || null, organizationId: String(upd.organizationId), causeId: String(upd.causeId) },
    });

    return ok(shapeUpdateRow(upd.toObject()));
  }) as unknown as NextResponse;
}
