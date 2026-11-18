import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Cause, ProgressUpdate, Review, Organization } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireReviewer } from '@/lib/reviewer-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OVERDUE_HOURS = 48;

export async function GET() {
  return withErrors(async () => {
    const user = await requireReviewer();
    if (user instanceof Response) return user;
    await connectDB();

    const reviewerObjId = new Types.ObjectId(user.id);
    const overdueBefore = new Date(Date.now() - OVERDUE_HOURS * 3600e3);
    const since = new Date(Date.now() - 7 * 86400e3);

    const [
      assignedCauses,
      assignedUpdates,
      overdueCauses,
      overdueUpdates,
      doneReviews,
      pendingOrgs,
      queueCauses,
      queueUpdates,
    ] = await Promise.all([
      Cause.countDocuments({ assignedReviewerId: reviewerObjId, status: { $in: ['pending', 'changes'] } }),
      ProgressUpdate.countDocuments({ assignedReviewerId: reviewerObjId, status: { $in: ['pending', 'changes'] } }),
      Cause.countDocuments({ assignedReviewerId: reviewerObjId, status: 'pending', submittedAt: { $lte: overdueBefore } }),
      ProgressUpdate.countDocuments({ assignedReviewerId: reviewerObjId, status: 'pending', submittedAt: { $lte: overdueBefore } }),
      Review.find({ reviewerId: reviewerObjId, createdAt: { $gte: since } }).lean(),
      Organization.countDocuments({ status: 'pending' }),
      Cause.countDocuments({ status: 'pending' }),
      ProgressUpdate.countDocuments({ status: 'pending' }),
    ]);

    let approve = 0, changes = 0, reject = 0;
    for (const r of doneReviews) {
      if (r.action === 'approve') approve++;
      else if (r.action === 'changes') changes++;
      else if (r.action === 'reject') reject++;
    }

    // Average decision time for completed reviews in last 30d — rough measure using Review.createdAt vs subject.submittedAt
    const since30 = new Date(Date.now() - 30 * 86400e3);
    const recent = await Review.find({ reviewerId: reviewerObjId, createdAt: { $gte: since30 }, subjectType: { $in: ['cause', 'update'] } }).sort({ createdAt: -1 }).limit(50).lean();
    let decisionDays: number[] = [];
    for (const r of recent) {
      const Model = (r.subjectType === 'cause' ? Cause : ProgressUpdate) as any;
      const subj = await Model.findById(r.subjectId, { submittedAt: 1 }).lean();
      if (subj?.submittedAt) {
        const diff = (+new Date(r.createdAt as any) - +new Date(subj.submittedAt)) / 86400e3;
        if (diff >= 0 && diff < 60) decisionDays.push(diff);
      }
    }
    const avgDecisionDays = decisionDays.length ? decisionDays.reduce((a, b) => a + b, 0) / decisionDays.length : null;

    // Oldest 5 items in queue (assigned or unassigned)
    const oldestCauses = await Cause.find({ status: 'pending' }).sort({ submittedAt: 1 }).limit(5).lean();
    const orgIds = Array.from(new Set(oldestCauses.map((c: any) => String(c.organizationId))));
    const orgs = orgIds.length ? await Organization.find({ _id: { $in: orgIds } }, { name: 1, gradient: 1 }).lean() : [];
    const orgMap = new Map(orgs.map((o: any) => [String(o._id), o]));
    const reviewerIds = Array.from(new Set(oldestCauses.map((c: any) => c.assignedReviewerId).filter(Boolean).map(String)));
    const reviewers = reviewerIds.length ? (await import('@/lib/models')).User.find({ _id: { $in: reviewerIds } }, { name: 1 }).lean() : Promise.resolve([] as any[]);
    const revArr = await reviewers;
    const revMap = new Map(revArr.map((u: any) => [String(u._id), u]));

    const queueOldest = oldestCauses.map((c: any) => ({
      id: String(c._id),
      publicId: c.publicId || '',
      title: c.title,
      gradient: c.gradient,
      category: c.category,
      status: c.status,
      submittedAt: c.submittedAt,
      organization: orgMap.get(String(c.organizationId))
        ? { name: (orgMap.get(String(c.organizationId)) as any).name, gradient: (orgMap.get(String(c.organizationId)) as any).gradient }
        : null,
      assignedReviewer: c.assignedReviewerId && revMap.get(String(c.assignedReviewerId))
        ? { name: (revMap.get(String(c.assignedReviewerId)) as any).name }
        : null,
      ageHours: c.submittedAt ? Math.round((Date.now() - +new Date(c.submittedAt)) / 3600e3) : null,
    }));

    return ok({
      reviewer: { id: user.id, name: user.name, role: user.role },
      metrics: {
        assigned: assignedCauses + assignedUpdates,
        assignedCauses,
        assignedUpdates,
        overdue: overdueCauses + overdueUpdates,
        done7d: doneReviews.length,
        approved7d: approve,
        changes7d: changes,
        rejected7d: reject,
        avgDecisionDays,
        pendingOrgs,
        queueCauses,
        queueUpdates,
      },
      queueOldest,
    });
  }) as unknown as NextResponse;
}
