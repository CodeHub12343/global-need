import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Cause, User } from '@/lib/models';
import { ok, notFound, fail, parseJSON, withErrors } from '@/lib/api';
import { requireReviewer } from '@/lib/reviewer-auth';
import { assignSchema } from '@/lib/validation/reviewer';
import { logAudit } from '@/lib/models/AuditLog';
import { isReviewer } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireReviewer();
    if (user instanceof Response) return user;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Submission not found');
    const input = await parseJSON(req, assignSchema);
    await connectDB();
    const cause = await Cause.findById(params.id);
    if (!cause) return notFound('Submission not found');

    const targetId = input.reviewerId === undefined ? user.id : input.reviewerId;
    if (targetId) {
      if (!Types.ObjectId.isValid(targetId)) return fail('Invalid reviewer', 400);
      const target = await User.findById(targetId);
      if (!target || !isReviewer(target.role)) return fail('Target is not a reviewer', 400);
      cause.assignedReviewerId = target._id as any;
    } else {
      cause.assignedReviewerId = undefined as any;
    }
    await cause.save();

    await logAudit({
      actorId: user.id as any,
      actorName: user.name,
      actorRole: user.role,
      action: 'cause.assigned',
      label: targetId ? 'Cause assigned' : 'Cause unassigned',
      subjectType: 'cause',
      subjectId: cause._id as any,
      subjectDescription: cause.title,
      metadata: { assignedReviewerId: targetId || null },
    });

    return ok({ assignedReviewerId: targetId || null });
  }) as unknown as NextResponse;
}
