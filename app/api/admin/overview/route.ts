import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cause, ProgressUpdate, Organization, Inquiry, User } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OVERDUE_HOURS = 48;

function rangeMs(range: string) {
  switch (range) {
    case '24h': return 86400e3;
    case '7d': return 7 * 86400e3;
    case '90d': return 90 * 86400e3;
    case 'year': return 365 * 86400e3;
    case '30d':
    default: return 30 * 86400e3;
  }
}

export async function GET(req: Request) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();

    const url = new URL(req.url);
    const range = url.searchParams.get('range') || '30d';
    const since = new Date(Date.now() - rangeMs(range));
    const overdueBefore = new Date(Date.now() - OVERDUE_HOURS * 3600e3);

    const [
      pendingCauses,
      pendingUpdates,
      overdueCauses,
      approvedCauses,
      approvedInRange,
      orgCount,
      pendingOrgs,
      openInquiries,
      unassignedInquiries,
    ] = await Promise.all([
      Cause.countDocuments({ status: 'pending' }),
      ProgressUpdate.countDocuments({ status: 'pending' }),
      Cause.countDocuments({ status: 'pending', submittedAt: { $lte: overdueBefore } }),
      Cause.countDocuments({ status: 'approved' }),
      Cause.countDocuments({ status: 'approved', publishedAt: { $gte: since } }),
      Organization.countDocuments({}),
      Organization.countDocuments({ status: 'pending' }),
      Inquiry.countDocuments({ status: { $in: ['new', 'waiting'] } }),
      Inquiry.countDocuments({ status: { $in: ['new', 'waiting'] }, assigneeId: { $exists: false } }),
    ]);

    // Oldest 4 pending for queue priorities panel
    const oldest = await Cause.find({ status: { $in: ['pending', 'changes'] } }).sort({ submittedAt: 1 }).limit(4).lean();
    const orgIds = Array.from(new Set(oldest.map((c: any) => String(c.organizationId))));
    const reviewerIds = Array.from(new Set(oldest.map((c: any) => c.assignedReviewerId).filter(Boolean).map(String)));
    const [orgs, reviewers] = await Promise.all([
      orgIds.length ? Organization.find({ _id: { $in: orgIds } }, { name: 1, gradient: 1 }).lean() : [],
      reviewerIds.length ? User.find({ _id: { $in: reviewerIds } }, { name: 1 }).lean() : [],
    ]);
    const orgMap = new Map(orgs.map((o: any) => [String(o._id), o]));
    const revMap = new Map(reviewers.map((u: any) => [String(u._id), u]));

    const queuePriorities = oldest.map((c: any) => ({
      id: String(c._id),
      title: c.title,
      status: c.status,
      gradient: c.gradient,
      ageHours: c.submittedAt ? Math.round((Date.now() - +new Date(c.submittedAt)) / 3600e3) : null,
      organization: orgMap.get(String(c.organizationId)) ? { name: (orgMap.get(String(c.organizationId)) as any).name, gradient: (orgMap.get(String(c.organizationId)) as any).gradient } : null,
      assignedReviewer: c.assignedReviewerId && revMap.get(String(c.assignedReviewerId)) ? { name: (revMap.get(String(c.assignedReviewerId)) as any).name } : null,
    }));

    // Submission trends — bucket per day over the range
    const buckets = Math.min(30, Math.ceil(rangeMs(range) / 86400e3));
    const bucketMs = rangeMs(range) / buckets;
    const trendStart = new Date(Date.now() - rangeMs(range));
    const [subRows, appRows] = await Promise.all([
      Cause.find({ submittedAt: { $gte: trendStart } }, { submittedAt: 1 }).lean(),
      Cause.find({ publishedAt: { $gte: trendStart } }, { publishedAt: 1 }).lean(),
    ]);
    const submissions = new Array(buckets).fill(0);
    const approvals = new Array(buckets).fill(0);
    for (const c of subRows) {
      const t = +new Date((c as any).submittedAt);
      const i = Math.min(buckets - 1, Math.max(0, Math.floor((t - +trendStart) / bucketMs)));
      submissions[i]++;
    }
    for (const c of appRows) {
      const t = +new Date((c as any).publishedAt);
      const i = Math.min(buckets - 1, Math.max(0, Math.floor((t - +trendStart) / bucketMs)));
      approvals[i]++;
    }

    // Avg time to decision — pending subs older than 0
    const pendingAll = await Cause.find({ status: 'pending' }, { submittedAt: 1 }).lean();
    const now = Date.now();
    const ages = pendingAll.map((c: any) => c.submittedAt ? (now - +new Date(c.submittedAt)) / 86400e3 : 0).filter((n) => n > 0);
    const avgPendingDays = ages.length ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;

    return ok({
      range,
      metrics: {
        pendingSubmissions: pendingCauses + pendingUpdates,
        pendingCauses,
        pendingUpdates,
        overdueCauses,
        avgPendingDays,
        approvedCauses,
        approvedInRange,
        organizations: orgCount,
        pendingOrgs,
        openInquiries,
        unassignedInquiries,
      },
      queuePriorities,
      trends: { submissions, approvals, buckets },
    });
  }) as unknown as NextResponse;
}
