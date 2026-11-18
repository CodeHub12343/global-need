import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cause } from '@/lib/models';
import { ok, created, fail, parseJSON, withErrors } from '@/lib/api';
import { requireOrgMember } from '@/lib/dashboard-auth';
import { causeBasicSchema } from '@/lib/validation/dashboard';
import { slugify, uniqueSlug } from '@/lib/slug';
import { shapeCauseRow } from '@/lib/dashboard-shape';
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
    const q = (url.searchParams.get('q') || '').trim();
    const category = url.searchParams.get('category') || '';
    const sort = url.searchParams.get('sort') || 'recent';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10) || 20));

    const filter: any = { organizationId: orgId };
    if (status !== 'all') filter.status = status;
    if (category) filter.category = category;
    if (q) {
      const r = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: r }, { shortDescription: r }, { publicId: r }];
    }
    const sortSpec: Record<string, 1 | -1> =
      sort === 'oldest' ? { updatedAt: 1 } : sort === 'title' ? { title: 1 } : { updatedAt: -1 };

    const [total, rows, countsAgg] = await Promise.all([
      Cause.countDocuments(filter),
      Cause.find(filter).sort(sortSpec).skip((page - 1) * limit).limit(limit).lean(),
      Cause.aggregate([
        { $match: { organizationId: orgId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);
    const counts: Record<string, number> = { all: 0, draft: 0, pending: 0, changes: 0, approved: 0, rejected: 0, suspended: 0 };
    for (const c of countsAgg) {
      counts[c._id] = c.count;
      counts.all += c.count;
    }

    return ok({
      items: rows.map(shapeCauseRow),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      counts,
    });
  }) as unknown as NextResponse;
}

export async function POST(req: Request) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    const { user, orgId } = ctx;
    const input = await parseJSON(req, causeBasicSchema);
    await connectDB();

    const slug = await uniqueSlug(input.title, async (s) => !!(await Cause.exists({ slug: s })));
    const cause = await Cause.create({
      ...input,
      slug,
      organizationId: orgId,
      submittedById: user.id,
      status: 'draft',
      lastUpdatedAt: new Date(),
    });
    await logAudit({
      actorId: user.id as any,
      actorName: user.name,
      actorRole: user.role,
      action: 'cause.draft_created',
      label: 'Cause draft created',
      subjectType: 'cause',
      subjectId: cause._id as any,
      subjectDescription: cause.title,
      metadata: { organizationId: String(orgId) },
    });
    return created(shapeCauseRow(cause.toObject()));
  }) as unknown as NextResponse;
}
