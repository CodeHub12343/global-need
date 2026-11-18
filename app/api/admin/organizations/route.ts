import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Organization, Cause } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { ORG_STATUSES } from '@/lib/models/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'all';
    const q = (url.searchParams.get('q') || '').trim();
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25', 10) || 25));

    const filter: any = {};
    if (status !== 'all' && ORG_STATUSES.includes(status as any)) filter.status = status;
    if (q) {
      const r = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: r }, { shortDescription: r }];
    }

    const [rows, total, counts] = await Promise.all([
      Organization.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Organization.countDocuments(filter),
      Organization.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const orgIds = rows.map((o: any) => o._id);
    const causeCounts = orgIds.length
      ? await Cause.aggregate([{ $match: { organizationId: { $in: orgIds } } }, { $group: { _id: '$organizationId', count: { $sum: 1 } } }])
      : [];
    const causeMap = new Map(causeCounts.map((c: any) => [String(c._id), c.count]));

    const items = rows.map((o: any) => ({
      id: String(o._id),
      name: o.name,
      slug: o.slug,
      category: o.category,
      country: o.country,
      city: o.city,
      status: o.status,
      verifiedAt: o.verifiedAt,
      gradient: o.gradient,
      initial: (o.initial || o.name?.[0] || '?').toUpperCase(),
      createdAt: o.createdAt,
      shortDescription: o.shortDescription,
      publicEmail: o.publicEmail,
      causesCount: causeMap.get(String(o._id)) || 0,
    }));

    const countsByStatus: Record<string, number> = {};
    for (const c of counts) countsByStatus[c._id] = c.count;

    return ok({ items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)), countsByStatus });
  }) as unknown as NextResponse;
}
