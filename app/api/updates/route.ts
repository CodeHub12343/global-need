import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ProgressUpdate, Cause, Organization } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { shapeUpdatePublic } from '@/lib/public-shape';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withErrors(async () => {
    await connectDB();
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || '';
    const causeSlug = url.searchParams.get('cause') || '';
    const orgSlug = url.searchParams.get('organization') || '';
    const limit = Math.min(48, Math.max(1, parseInt(url.searchParams.get('limit') || '12', 10) || 12));
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);

    const causeFilter: any = { status: 'approved' };
    if (category && category !== 'all') causeFilter.category = category;
    if (causeSlug) causeFilter.slug = causeSlug;
    if (orgSlug) {
      const o = await Organization.findOne({ slug: orgSlug }, { _id: 1 }).lean();
      if (!o) return ok({ items: [], page, limit, total: 0, totalPages: 1 });
      causeFilter.organizationId = (o as any)._id;
    }
    const causes = await Cause.find(causeFilter, { _id: 1, slug: 1, title: 1, category: 1, gradient: 1, organizationId: 1 }).lean();
    if (!causes.length) return ok({ items: [], page, limit, total: 0, totalPages: 1 });

    const causeIds = causes.map((c: any) => c._id);
    const updFilter = { causeId: { $in: causeIds }, status: 'approved' };
    const [total, rows] = await Promise.all([
      ProgressUpdate.countDocuments(updFilter),
      ProgressUpdate.find(updFilter)
        .sort({ approvedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const causeMap = new Map(causes.map((c: any) => [String(c._id), c]));
    const orgIds = Array.from(new Set(causes.map((c: any) => String(c.organizationId))));
    const orgs = await Organization.find({ _id: { $in: orgIds } }).lean();
    const orgMap = new Map(orgs.map((o: any) => [String(o._id), o]));

    const items = rows.map((u: any) => {
      const cause = causeMap.get(String(u.causeId));
      const org = orgMap.get(String(u.organizationId));
      return shapeUpdatePublic(u, cause as any, org as any);
    });

    return ok({ items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
  }) as unknown as NextResponse;
}
