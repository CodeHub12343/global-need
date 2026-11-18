import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Cause } from '@/lib/models';
import { ok, fail, notFound, parseJSON, withErrors } from '@/lib/api';
import { requireOrgMember } from '@/lib/dashboard-auth';
import { causeFullSchema } from '@/lib/validation/dashboard';
import { shapeCauseRow } from '@/lib/dashboard-shape';
import { logAudit } from '@/lib/models/AuditLog';
import { slugify, uniqueSlug } from '@/lib/slug';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Cause not found');
    await connectDB();
    const cause = await Cause.findOne({ _id: params.id, organizationId: ctx.orgId }).lean();
    if (!cause) return notFound('Cause not found');
    return ok(shapeCauseRow(cause));
  }) as unknown as NextResponse;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Cause not found');
    const input = await parseJSON(req, causeFullSchema.partial());
    await connectDB();
    const cause = await Cause.findOne({ _id: params.id, organizationId: ctx.orgId });
    if (!cause) return notFound('Cause not found');
    if (cause.status === 'approved' || cause.status === 'suspended') {
      return fail('Approved causes must be re-submitted through the review flow', 409);
    }
    const patch: any = { ...input, lastUpdatedAt: new Date() };
    if (input.title && input.title !== cause.title) {
      patch.slug = await uniqueSlug(input.title, async (s) => !!(await Cause.exists({ slug: s, _id: { $ne: cause._id } })));
    }
    if (cause.status === 'changes') patch.status = 'draft';
    Object.assign(cause, patch);
    await cause.save();
    await logAudit({
      actorId: ctx.user.id as any,
      actorName: ctx.user.name,
      actorRole: ctx.user.role,
      action: 'cause.updated',
      label: 'Cause updated',
      subjectType: 'cause',
      subjectId: cause._id as any,
      subjectDescription: cause.title,
      metadata: { organizationId: String(ctx.orgId) },
    });
    return ok(shapeCauseRow(cause.toObject()));
  }) as unknown as NextResponse;
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Cause not found');
    await connectDB();
    const cause = await Cause.findOne({ _id: params.id, organizationId: ctx.orgId });
    if (!cause) return notFound('Cause not found');
    if (cause.status !== 'draft') return fail('Only drafts can be deleted', 409);
    await cause.deleteOne();
    await logAudit({
      actorId: ctx.user.id as any,
      actorName: ctx.user.name,
      actorRole: ctx.user.role,
      action: 'cause.draft_deleted',
      label: 'Cause draft deleted',
      subjectType: 'cause',
      subjectId: cause._id as any,
      subjectDescription: cause.title,
      metadata: { organizationId: String(ctx.orgId) },
    });
    return ok({ deleted: true });
  }) as unknown as NextResponse;
}
