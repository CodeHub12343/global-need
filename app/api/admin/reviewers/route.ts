import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, Cause, ProgressUpdate, Review } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GRADIENTS = [
  'linear-gradient(135deg,#B45309,#92400E)',
  'linear-gradient(135deg,#5B21B6,#312E81)',
  'linear-gradient(135deg,#0E7490,#155E75)',
  'linear-gradient(135deg,#9A3412,#7C2D12)',
  'linear-gradient(135deg,#166534,#14532D)',
  'linear-gradient(135deg,#0F766E,#115E59)',
];

export async function GET() {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();

    const reviewers = await User.find({ role: { $in: ['reviewer', 'senior_reviewer'] } }).sort({ createdAt: 1 }).lean();
    const ids = reviewers.map((u: any) => u._id);

    const since = new Date(Date.now() - 90 * 86400e3);
    const [openCauses, openUpdates, decisions] = await Promise.all([
      ids.length ? Cause.aggregate([{ $match: { assignedReviewerId: { $in: ids }, status: { $in: ['pending', 'changes'] } } }, { $group: { _id: '$assignedReviewerId', n: { $sum: 1 } } }]) : [],
      ids.length ? ProgressUpdate.aggregate([{ $match: { assignedReviewerId: { $in: ids }, status: { $in: ['pending', 'changes'] } } }, { $group: { _id: '$assignedReviewerId', n: { $sum: 1 } } }]) : [],
      ids.length ? Review.aggregate([{ $match: { reviewerId: { $in: ids }, createdAt: { $gte: since } } }, { $group: { _id: '$reviewerId', n: { $sum: 1 } } }]) : [],
    ]);
    const loadCauseMap = new Map(openCauses.map((r: any) => [String(r._id), r.n]));
    const loadUpdateMap = new Map(openUpdates.map((r: any) => [String(r._id), r.n]));
    const decMap = new Map(decisions.map((r: any) => [String(r._id), r.n]));

    const items = reviewers.map((u: any, i: number) => {
      const load = (loadCauseMap.get(String(u._id)) || 0) + (loadUpdateMap.get(String(u._id)) || 0);
      const capacity = u.workloadCapacity || 6;
      return {
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        level: u.role === 'senior_reviewer' ? 'senior' : 'reviewer',
        initials: (u.name || 'U').split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase(),
        gradient: GRADIENTS[i % GRADIENTS.length],
        capabilities: u.reviewerCapabilities || [],
        status: u.status,
        available: u.status === 'active',
        load,
        capacity,
        loadHot: load >= capacity,
        decisions90d: decMap.get(String(u._id)) || 0,
        joined: u.createdAt,
      };
    });

    const metrics = {
      active: items.filter((r) => r.available).length,
      onLeave: items.filter((r) => !r.available).length,
      openAssignments: items.reduce((a, b) => a + b.load, 0),
    };

    return ok({ items, metrics });
  }) as unknown as NextResponse;
}
