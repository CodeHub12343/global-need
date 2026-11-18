import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cause, Organization, User } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { CAUSE_STATUSES } from '@/lib/models/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'all';
    const category = url.searchParams.get('category') || '';
    const orgId = url.searchParams.get('organizationId') || '';
    const reviewerId = url.searchParams.get('reviewerId') || '';
    const q = (url.searchParams.get('q') || '').trim();
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25', 10) || 25));

    const filter: any = {};
    if (status !== 'all' && CAUSE_STATUSES.includes(status as any)) filter.status = status;
    if (category) filter.category = category;
    if (orgId) filter.organizationId = orgId;
    if (reviewerId === 'unassigned') filter.assignedReviewerId = { $exists: false };
    else if (reviewerId) filter.assignedReviewerId = reviewerId;
    if (q) {
      const r = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: r }, { shortDescription: r }, { publicId: r }];
    }

    const [rows, total, counts] = await Promise.all([
      Cause.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Cause.countDocuments(filter),
      Cause.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const orgIds = Array.from(new Set(rows.map((r: any) => String(r.organizationId))));
    const reviewerIds = Array.from(new Set(rows.map((r: any) => r.assignedReviewerId).filter(Boolean).map(String)));
    const [orgs, reviewers] = await Promise.all([
      orgIds.length ? Organization.find({ _id: { $in: orgIds } }, { name: 1, gradient: 1 }).lean() : [],
      reviewerIds.length ? User.find({ _id: { $in: reviewerIds } }, { name: 1 }).lean() : [],
    ]);
    const orgMap = new Map(orgs.map((o: any) => [String(o._id), o]));
    const revMap = new Map(reviewers.map((u: any) => [String(u._id), u]));

    const items = rows.map((c: any) => ({
      id: String(c._id),
      publicId: c.publicId || '',
      slug: c.slug,
      title: c.title,
      shortDescription: c.shortDescription,
      category: c.category,
      status: c.status,
      featured: !!c.featured,
      gradient: c.gradient,
      submittedAt: c.submittedAt,
      publishedAt: c.publishedAt,
      lastUpdatedAt: c.lastUpdatedAt || c.updatedAt,
      organization: orgMap.get(String(c.organizationId)) ? { id: String(c.organizationId), name: (orgMap.get(String(c.organizationId)) as any).name, gradient: (orgMap.get(String(c.organizationId)) as any).gradient } : null,
      assignedReviewer: c.assignedReviewerId && revMap.get(String(c.assignedReviewerId)) ? { id: String(c.assignedReviewerId), name: (revMap.get(String(c.assignedReviewerId)) as any).name } : null,
    }));

    const countsByStatus: Record<string, number> = {};
    for (const c of counts) countsByStatus[c._id] = c.count;

    return ok({ items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)), countsByStatus });
  }) as unknown as NextResponse;
}
