import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Cause, ProgressUpdate } from '@/lib/models';
import { ok, created, fail, parseJSON, withErrors } from '@/lib/api';
import { requireOrgMember } from '@/lib/dashboard-auth';
import { updateDraftSchema } from '@/lib/validation/dashboard';
import { shapeUpdateRow } from '@/lib/dashboard-shape';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    const { orgId } = ctx;
    await connectDB();
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'all';
    const causeId = url.searchParams.get('causeId') || '';
    const filter: any = { organizationId: orgId };
    if (status !== 'all') filter.status = status;
    if (causeId && Types.ObjectId.isValid(causeId)) filter.causeId = new Types.ObjectId(causeId);

    const rows = await ProgressUpdate.find(filter).sort({ updatedAt: -1 }).limit(100).lean();
    const causeIds = Array.from(new Set(rows.map((r: any) => String(r.causeId))));
    const causes = await Cause.find({ _id: { $in: causeIds } }, { _id: 1, title: 1, slug: 1 }).lean();
    const causeMap = new Map(causes.map((c: any) => [String(c._id), c]));

    const countsAgg = await ProgressUpdate.aggregate([
      { $match: { organizationId: orgId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const counts: Record<string, number> = { all: 0, draft: 0, pending: 0, changes: 0, approved: 0, rejected: 0 };
    for (const c of countsAgg) {
      counts[c._id] = c.count;
      counts.all += c.count;
    }

    return ok({
      items: rows.map((u: any) => shapeUpdateRow(u, causeMap.get(String(u.causeId)))),
      counts,
    });
  }) as unknown as NextResponse;
}

export async function POST(req: Request) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    const input = await parseJSON(req, updateDraftSchema);
    await connectDB();
    if (!Types.ObjectId.isValid(input.causeId)) return fail('Invalid cause', 400);
    const cause = await Cause.findOne({ _id: input.causeId, organizationId: ctx.orgId, status: 'approved' });
    if (!cause) return fail('Updates can only be posted on approved causes you own', 403);

    const upd = await ProgressUpdate.create({
      causeId: cause._id,
      organizationId: ctx.orgId,
      authorId: ctx.user.id,
      title: input.title,
      body: input.body || '',
      consentLogAttached: !!input.consentLogAttached,
      status: 'draft',
    });
    await logAudit({
      actorId: ctx.user.id as any,
      actorName: ctx.user.name,
      actorRole: ctx.user.role,
      action: 'update.draft_created',
      label: 'Progress update draft created',
      subjectType: 'update',
      subjectId: upd._id as any,
      subjectDescription: upd.title,
      metadata: { organizationId: String(ctx.orgId), causeId: String(cause._id) },
    });
    return created(shapeUpdateRow(upd.toObject(), { title: cause.title, slug: cause.slug }));
  }) as unknown as NextResponse;
}
