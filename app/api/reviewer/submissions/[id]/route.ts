import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Cause, Organization, DocumentFile, User, Review } from '@/lib/models';
import { ok, notFound, withErrors } from '@/lib/api';
import { requireReviewer } from '@/lib/reviewer-auth';
import { shapeOrganizationPublic } from '@/lib/public-shape';
import { shapeCauseRow, shapeDocument } from '@/lib/dashboard-shape';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireReviewer();
    if (user instanceof Response) return user;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Submission not found');
    await connectDB();
    const cause = await Cause.findById(params.id).lean();
    if (!cause) return notFound('Submission not found');
    const [org, docs, submittedBy, assignedReviewer, reviews] = await Promise.all([
      Organization.findById((cause as any).organizationId).lean(),
      DocumentFile.find({
        organizationId: (cause as any).organizationId,
        $or: [{ causeId: (cause as any)._id }, { causeId: { $exists: false } }, { causeId: null }],
      }).lean(),
      (cause as any).submittedById ? User.findById((cause as any).submittedById, { name: 1, email: 1 }).lean() : null,
      (cause as any).assignedReviewerId ? User.findById((cause as any).assignedReviewerId, { name: 1 }).lean() : null,
      Review.find({ subjectType: 'cause', subjectId: (cause as any)._id }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);
    const reviewerIds = Array.from(new Set(reviews.map((r: any) => String(r.reviewerId))));
    const reviewers = reviewerIds.length ? await User.find({ _id: { $in: reviewerIds } }, { name: 1 }).lean() : [];
    const revMap = new Map(reviewers.map((u: any) => [String(u._id), u]));

    return ok({
      cause: shapeCauseRow(cause),
      organization: org ? shapeOrganizationPublic(org as any) : null,
      documents: docs.map(shapeDocument),
      submittedBy: submittedBy ? { id: String((submittedBy as any)._id), name: (submittedBy as any).name, email: (submittedBy as any).email } : null,
      assignedReviewer: assignedReviewer ? { id: String((assignedReviewer as any)._id), name: (assignedReviewer as any).name } : null,
      history: reviews.map((r: any) => ({
        id: String(r._id),
        action: r.action,
        reason: r.reason || '',
        internalNotes: r.internalNotes || '',
        checklist: r.checklist || [],
        reviewer: revMap.get(String(r.reviewerId)) ? { id: String(r.reviewerId), name: (revMap.get(String(r.reviewerId)) as any).name } : null,
        createdAt: r.createdAt,
      })),
    });
  }) as unknown as NextResponse;
}
