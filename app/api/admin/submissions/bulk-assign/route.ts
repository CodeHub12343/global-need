import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cause, ProgressUpdate, Inquiry, User, logAudit } from '@/lib/models';
import { ok, notFound, withErrors, parseJSON, fail } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { bulkAssignSchema } from '@/lib/validation/admin';
import { isReviewer } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const input = await parseJSON(req, bulkAssignSchema);

    if (input.reviewerId) {
      const r = await User.findById(input.reviewerId);
      if (!r) return notFound('Reviewer not found');
      if (input.kind !== 'inquiry' && !isReviewer(r.role)) return fail('Selected user is not a reviewer', 422);
    }

    const Model: any = input.kind === 'cause' ? Cause : input.kind === 'update' ? ProgressUpdate : Inquiry;
    const field = input.kind === 'inquiry' ? 'assigneeId' : 'assignedReviewerId';

    const res = await Model.updateMany(
      { _id: { $in: input.ids } },
      input.reviewerId ? { $set: { [field]: input.reviewerId } } : { $unset: { [field]: '' } },
    );

    await logAudit({
      actorId: user.id as any, actorName: user.name, actorRole: user.role,
      action: 'admin.bulk_assign', label: input.reviewerId ? 'Bulk assigned' : 'Bulk unassigned',
      subjectType: input.kind, subjectDescription: `${input.ids.length} item(s)`,
      metadata: { reviewerId: input.reviewerId, ids: input.ids },
    });

    return ok({ matched: res.matchedCount ?? res.n, modified: res.modifiedCount ?? res.nModified });
  }) as unknown as NextResponse;
}
