import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { ProgressUpdate, Cause } from '@/lib/models';
import { ok, fail, notFound, withErrors } from '@/lib/api';
import { requireOrgMember } from '@/lib/dashboard-auth';
import { shapeUpdateRow } from '@/lib/dashboard-shape';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Update not found');
    await connectDB();
    const upd = await ProgressUpdate.findOne({ _id: params.id, organizationId: ctx.orgId });
    if (!upd) return notFound('Update not found');
    if (!['draft', 'changes'].includes(upd.status)) return fail('Already submitted', 409);
    if (!upd.title || !upd.body) return fail('Title and body are required', 422);
    upd.status = 'pending';
    upd.submittedAt = new Date();
    await upd.save();
    await logAudit({
      actorId: ctx.user.id as any,
      actorName: ctx.user.name,
      actorRole: ctx.user.role,
      action: 'update.submitted',
      label: 'Progress update submitted',
      subjectType: 'update',
      subjectId: upd._id as any,
      subjectDescription: upd.title,
      metadata: { organizationId: String(ctx.orgId) },
    });
    const cause = await Cause.findById(upd.causeId, { title: 1, slug: 1 }).lean();
    return ok(shapeUpdateRow(upd.toObject(), cause as any));
  }) as unknown as NextResponse;
}
