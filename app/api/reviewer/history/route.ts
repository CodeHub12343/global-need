import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Review, Cause, ProgressUpdate, Organization } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireReviewer } from '@/lib/reviewer-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withErrors(async () => {
    const user = await requireReviewer();
    if (user instanceof Response) return user;
    await connectDB();
    const url = new URL(req.url);
    const mine = url.searchParams.get('mine') !== 'false';
    const action = url.searchParams.get('action') || '';
    const subject = url.searchParams.get('subject') || '';
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));

    const filter: any = {};
    if (mine) filter.reviewerId = new Types.ObjectId(user.id);
    if (action) filter.action = action;
    if (subject) filter.subjectType = subject;

    const reviews = await Review.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

    // Resolve subject titles
    const causeIds = reviews.filter((r: any) => r.subjectType === 'cause').map((r: any) => r.subjectId);
    const updIds = reviews.filter((r: any) => r.subjectType === 'update').map((r: any) => r.subjectId);
    const orgIds = reviews.filter((r: any) => r.subjectType === 'organization').map((r: any) => r.subjectId);
    const [causes, updates, orgs] = await Promise.all([
      causeIds.length ? Cause.find({ _id: { $in: causeIds } }, { title: 1, slug: 1, publicId: 1, status: 1 }).lean() : [],
      updIds.length ? ProgressUpdate.find({ _id: { $in: updIds } }, { title: 1, status: 1 }).lean() : [],
      orgIds.length ? Organization.find({ _id: { $in: orgIds } }, { name: 1, slug: 1, status: 1 }).lean() : [],
    ]);
    const cmap = new Map(causes.map((c: any) => [String(c._id), c]));
    const umap = new Map(updates.map((u: any) => [String(u._id), u]));
    const omap = new Map(orgs.map((o: any) => [String(o._id), o]));

    return ok(
      reviews.map((r: any) => {
        const subj = r.subjectType === 'cause'
          ? cmap.get(String(r.subjectId))
          : r.subjectType === 'update'
            ? umap.get(String(r.subjectId))
            : omap.get(String(r.subjectId));
        return {
          id: String(r._id),
          subjectType: r.subjectType,
          subjectId: String(r.subjectId),
          subjectTitle: subj ? ((subj as any).title || (subj as any).name) : '(removed)',
          action: r.action,
          reason: r.reason || '',
          createdAt: r.createdAt,
        };
      }),
    );
  }) as unknown as NextResponse;
}
