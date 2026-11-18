import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cause, Inquiry, Review, User } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function rangeDays(range: string) {
  switch (range) {
    case '7d': return 7;
    case '30d': return 30;
    case 'year': return 365;
    case '90d':
    default: return 90;
  }
}

export async function GET(req: Request) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const url = new URL(req.url);
    const range = url.searchParams.get('range') || '90d';
    const days = rangeDays(range);
    const since = new Date(Date.now() - days * 86400e3);
    const prior = new Date(Date.now() - days * 2 * 86400e3);

    const [submissions, submittedPrior, approved, approvedPrior, inquiries, inquiriesPrior] = await Promise.all([
      Cause.countDocuments({ submittedAt: { $gte: since } }),
      Cause.countDocuments({ submittedAt: { $gte: prior, $lt: since } }),
      Cause.countDocuments({ status: 'approved', publishedAt: { $gte: since } }),
      Cause.countDocuments({ status: 'approved', publishedAt: { $gte: prior, $lt: since } }),
      Inquiry.countDocuments({ createdAt: { $gte: since } }),
      Inquiry.countDocuments({ createdAt: { $gte: prior, $lt: since } }),
    ]);

    // Weekly volume — 12 weeks
    const weeks = 12;
    const weekMs = 7 * 86400e3;
    const trendStart = new Date(Date.now() - weeks * weekMs);
    const [subRows, appRows] = await Promise.all([
      Cause.find({ submittedAt: { $gte: trendStart } }, { submittedAt: 1 }).lean(),
      Cause.find({ publishedAt: { $gte: trendStart } }, { publishedAt: 1 }).lean(),
    ]);
    const submitted = new Array(weeks).fill(0);
    const approvedW = new Array(weeks).fill(0);
    for (const c of subRows) {
      const i = Math.min(weeks - 1, Math.max(0, Math.floor((+new Date((c as any).submittedAt) - +trendStart) / weekMs)));
      submitted[i]++;
    }
    for (const c of appRows) {
      const i = Math.min(weeks - 1, Math.max(0, Math.floor((+new Date((c as any).publishedAt) - +trendStart) / weekMs)));
      approvedW[i]++;
    }

    // By category
    const byCategoryRows = await Cause.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', n: { $sum: 1 } } },
      { $sort: { n: -1 } },
    ]);
    const byCategory = byCategoryRows.map((r: any) => ({ category: r._id, count: r.n }));
    const byCategoryTotal = byCategory.reduce((a, b) => a + b.count, 0);

    // Reviewer response times — median days from submission to first Review decision
    const reviewers = await User.find({ role: { $in: ['reviewer', 'senior_reviewer'] } }, { name: 1 }).lean();
    const reviewerTimes: { name: string; medianDays: number; samples: number }[] = [];
    for (const r of reviewers) {
      const revs = await Review.find({ reviewerId: (r as any)._id, subjectType: 'cause', createdAt: { $gte: since } }).lean();
      const diffs: number[] = [];
      for (const rv of revs) {
        const c = await Cause.findById((rv as any).subjectId, { submittedAt: 1 }).lean();
        if (c && (c as any).submittedAt) {
          const d = (+new Date((rv as any).createdAt) - +new Date((c as any).submittedAt)) / 86400e3;
          if (d >= 0 && d < 60) diffs.push(d);
        }
      }
      diffs.sort((a, b) => a - b);
      const median = diffs.length ? diffs[Math.floor(diffs.length / 2)] : 0;
      reviewerTimes.push({ name: (r as any).name, medianDays: Math.round(median * 10) / 10, samples: diffs.length });
    }

    // Inquiry types
    const inquiryTypeRows = await Inquiry.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$type', n: { $sum: 1 }, replied: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$messages', []] } }, 0] }, 1, 0] } } } },
      { $sort: { n: -1 } },
    ]);

    // Avg review time (days) — all approved/changes/rejected in range
    const decidedReviews = await Review.find({ createdAt: { $gte: since }, subjectType: 'cause', action: { $in: ['approve', 'changes', 'reject'] } }).lean();
    const decTimes: number[] = [];
    for (const r of decidedReviews) {
      const c = await Cause.findById((r as any).subjectId, { submittedAt: 1 }).lean();
      if (c && (c as any).submittedAt) {
        const d = (+new Date((r as any).createdAt) - +new Date((c as any).submittedAt)) / 86400e3;
        if (d >= 0 && d < 60) decTimes.push(d);
      }
    }
    const avgDecisionDays = decTimes.length ? Math.round((decTimes.reduce((a, b) => a + b, 0) / decTimes.length) * 10) / 10 : 0;

    return ok({
      range,
      kpis: {
        submissions,
        submittedDelta: submittedPrior ? Math.round(((submissions - submittedPrior) / submittedPrior) * 100) : null,
        approved,
        approvalRate: submissions ? Math.round((approved / submissions) * 100) : 0,
        avgReviewDays: avgDecisionDays,
        inquiries,
        inquiriesDelta: inquiriesPrior ? Math.round(((inquiries - inquiriesPrior) / inquiriesPrior) * 100) : null,
      },
      weekly: { submitted, approved: approvedW, weeks },
      byCategory: { items: byCategory, total: byCategoryTotal },
      reviewerTimes,
      inquiryTypes: inquiryTypeRows.map((r: any) => ({
        type: r._id,
        count: r.n,
        repliedPct: r.n ? Math.round((r.replied / r.n) * 100) : 0,
      })),
    });
  }) as unknown as NextResponse;
}
