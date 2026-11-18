import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { ProgressUpdate, Cause } from '@/lib/models';
import { ok, fail, notFound, parseJSON, withErrors } from '@/lib/api';
import { requireOrgMember } from '@/lib/dashboard-auth';
import { updateDraftSchema } from '@/lib/validation/dashboard';
import { shapeUpdateRow } from '@/lib/dashboard-shape';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Update not found');
    await connectDB();
    const upd = await ProgressUpdate.findOne({ _id: params.id, organizationId: ctx.orgId }).lean();
    if (!upd) return notFound('Update not found');
    const cause = await Cause.findById((upd as any).causeId, { title: 1, slug: 1 }).lean();
    return ok(shapeUpdateRow(upd as any, cause as any));
  }) as unknown as NextResponse;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Update not found');
    const input = await parseJSON(req, updateDraftSchema.partial().omit({ causeId: true as any }));
    await connectDB();
    const upd = await ProgressUpdate.findOne({ _id: params.id, organizationId: ctx.orgId });
    if (!upd) return notFound('Update not found');
    if (upd.status === 'approved' || upd.status === 'rejected') return fail('This update is finalized', 409);
    if (input.title) upd.title = input.title;
    if (input.body !== undefined) upd.body = input.body;
    if (input.consentLogAttached !== undefined) upd.consentLogAttached = !!input.consentLogAttached;
    if (upd.status === 'changes') upd.status = 'draft';
    await upd.save();
    const cause = await Cause.findById(upd.causeId, { title: 1, slug: 1 }).lean();
    return ok(shapeUpdateRow(upd.toObject(), cause as any));
  }) as unknown as NextResponse;
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Update not found');
    await connectDB();
    const upd = await ProgressUpdate.findOne({ _id: params.id, organizationId: ctx.orgId });
    if (!upd) return notFound('Update not found');
    if (upd.status !== 'draft') return fail('Only drafts can be deleted', 409);
    await upd.deleteOne();
    await logAudit({
      actorId: ctx.user.id as any,
      actorName: ctx.user.name,
      actorRole: ctx.user.role,
      action: 'update.draft_deleted',
      label: 'Progress update draft deleted',
      subjectType: 'update',
      subjectId: upd._id as any,
      subjectDescription: upd.title,
      metadata: { organizationId: String(ctx.orgId) },
    });
    return ok({ deleted: true });
  }) as unknown as NextResponse;
}
