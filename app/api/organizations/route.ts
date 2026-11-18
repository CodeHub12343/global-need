import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Organization, Cause } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { shapeOrganizationPublic } from '@/lib/public-shape';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withErrors(async () => {
    await connectDB();
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    const categoryParam = url.searchParams.get('category') || '';
    const categories = categoryParam ? categoryParam.split(',').filter(Boolean) : [];
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(url.searchParams.get('limit') || '24', 10) || 24));

    const filter: any = { status: 'verified' };
    if (categories.length) filter.category = { $in: categories };
    if (q) {
      const r = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: r }, { shortDescription: r }, { city: r }, { country: r }];
    }

    const [total, rows] = await Promise.all([
      Organization.countDocuments(filter),
      Organization.find(filter)
        .sort({ verifiedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const ids = rows.map((o: any) => o._id);
    const counts = await Cause.aggregate([
      { $match: { status: 'approved', organizationId: { $in: ids } } },
      { $group: { _id: '$organizationId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>(counts.map((c: any) => [String(c._id), c.count]));

    const items = rows.map((o: any) => ({
      ...shapeOrganizationPublic(o),
      publishedCauses: countMap.get(String(o._id)) || 0,
    }));

    return ok({
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }) as unknown as NextResponse;
}
