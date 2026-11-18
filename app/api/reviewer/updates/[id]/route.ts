import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { ProgressUpdate, Cause, Organization, User, Review } from '@/lib/models';
import { ok, notFound, withErrors } from '@/lib/api';
import { requireReviewer } from '@/lib/reviewer-auth';
import { shapeUpdateRow } from '@/lib/dashboard-shape';
import { shapeOrganizationPublic } from '@/lib/public-shape';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireReviewer();
    if (user instanceof Response) return user;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Update not found');
    await connectDB();
    const upd = await ProgressUpdate.findById(params.id).lean();
    if (!upd) return notFound('Update not found');
    const [cause, org, author, assignedReviewer, reviews] = await Promise.all([
      Cause.findById((upd as any).causeId).lean(),
      Organization.findById((upd as any).organizationId).lean(),
      (upd as any).authorId ? User.findById((upd as any).authorId, { name: 1 }).lean() : null,
      (upd as any).assignedReviewerId ? User.findById((upd as any).assignedReviewerId, { name: 1 }).lean() : null,
      Review.find({ subjectType: 'update', subjectId: (upd as any)._id }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);
    const reviewerIds = Array.from(new Set(reviews.map((r: any) => String(r.reviewerId))));
    const reviewers = reviewerIds.length ? await User.find({ _id: { $in: reviewerIds } }, { name: 1 }).lean() : [];
    const revMap = new Map(reviewers.map((u: any) => [String(u._id), u]));

    return ok({
      update: shapeUpdateRow(upd as any, cause as any),
      cause: cause ? { id: String((cause as any)._id), title: (cause as any).title, slug: (cause as any).slug, status: (cause as any).status } : null,
      organization: org ? shapeOrganizationPublic(org as any) : null,
      author: author ? { id: String((author as any)._id), name: (author as any).name } : null,
      assignedReviewer: assignedReviewer ? { id: String((assignedReviewer as any)._id), name: (assignedReviewer as any).name } : null,
      history: reviews.map((r: any) => ({
        id: String(r._id),
        action: r.action,
        reason: r.reason || '',
        internalNotes: r.internalNotes || '',
        reviewer: revMap.get(String(r.reviewerId)) ? { id: String(r.reviewerId), name: (revMap.get(String(r.reviewerId)) as any).name } : null,
        createdAt: r.createdAt,
      })),
    });
  }) as unknown as NextResponse;
}
