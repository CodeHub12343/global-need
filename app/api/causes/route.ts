import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cause, Organization, ProgressUpdate } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { shapeCausePublic } from '@/lib/public-shape';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withErrors(async () => {
    await connectDB();
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    const categoryParam = url.searchParams.get('category') || '';
    const categories = categoryParam ? categoryParam.split(',').filter(Boolean) : [];
    const verifiedOnly = url.searchParams.get('verified') === 'true';
    const hasUpdates = url.searchParams.get('hasUpdates') === 'true';
    const period = url.searchParams.get('period') || 'any';
    const sort = url.searchParams.get('sort') || 'recent';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(url.searchParams.get('limit') || '12', 10) || 12));

    const filter: any = { status: 'approved' };
    if (categories.length) filter.category = { $in: categories };
    if (q) {
      const r = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: r },
        { shortDescription: r },
        { story: r },
        { city: r },
        { country: r },
      ];
    }
    if (period !== 'any') {
      const now = Date.now();
      const windowMs = period === '7d' ? 7 * 86400e3 : period === '30d' ? 30 * 86400e3 : 0;
      if (windowMs) filter.lastUpdatedAt = { $gte: new Date(now - windowMs) };
    }

    if (verifiedOnly) {
      const verifiedOrgIds = await Organization.find({ status: 'verified' }, { _id: 1 }).lean();
      filter.organizationId = { $in: verifiedOrgIds.map((o: any) => o._id) };
    }

    const sortSpec: Record<string, 1 | -1> =
      sort === 'oldest'
        ? { publishedAt: 1 }
        : sort === 'updated'
          ? { lastUpdatedAt: -1 }
          : { publishedAt: -1 };

    const [total, rows] = await Promise.all([
      Cause.countDocuments(filter),
      Cause.find(filter)
        .sort(sortSpec)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: 'organizationId', model: Organization })
        .lean(),
    ]);

    let items = rows.map((c: any) => shapeCausePublic(c, c.organizationId));

    if (hasUpdates && items.length) {
      const ids = items.map((i) => i.id);
      const withUpd = await ProgressUpdate.distinct('causeId', {
        causeId: { $in: ids },
        status: 'approved',
      });
      const set = new Set(withUpd.map((v: any) => String(v)));
      items = items.filter((i) => set.has(i.id));
    }

    return ok({
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }) as unknown as NextResponse;
}
