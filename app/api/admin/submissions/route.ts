import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cause, ProgressUpdate, Organization, User } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OVERDUE_HOURS = 48;
const WARN_HOURS = 24;

export async function GET(req: Request) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const url = new URL(req.url);
    const tab = url.searchParams.get('tab') || 'all';
    const q = (url.searchParams.get('q') || '').trim();

    const baseStatus = ['pending', 'changes'];
    const filterC: any = { status: { $in: baseStatus } };
    const filterU: any = { status: { $in: baseStatus } };
    if (tab === 'unassigned') { filterC.assignedReviewerId = { $exists: false }; filterU.assignedReviewerId = { $exists: false }; }
    if (tab === 'overdue') { filterC.submittedAt = { $lte: new Date(Date.now() - WARN_HOURS * 3600e3) }; filterU.submittedAt = { $lte: new Date(Date.now() - WARN_HOURS * 3600e3) }; }
    if (tab === 'changes') { filterC.status = 'changes'; filterU.status = 'changes'; }
    if (q) {
      const r = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filterC.$or = [{ title: r }, { publicId: r }];
      filterU.$or = [{ title: r }];
    }

    const [causes, updates] = await Promise.all([
      Cause.find(filterC).sort({ submittedAt: 1 }).limit(60).lean(),
      ProgressUpdate.find(filterU).sort({ submittedAt: 1 }).limit(60).lean(),
    ]);
    const orgIds = Array.from(new Set([...causes, ...updates].map((r: any) => String(r.organizationId))));
    const reviewerIds = Array.from(new Set([...causes, ...updates].map((r: any) => r.assignedReviewerId).filter(Boolean).map(String)));
    const [orgs, reviewers] = await Promise.all([
      orgIds.length ? Organization.find({ _id: { $in: orgIds } }, { name: 1, gradient: 1 }).lean() : [],
      reviewerIds.length ? User.find({ _id: { $in: reviewerIds } }, { name: 1 }).lean() : [],
    ]);
    const orgMap = new Map(orgs.map((o: any) => [String(o._id), o]));
    const revMap = new Map(reviewers.map((u: any) => [String(u._id), u]));

    function toAgeTone(h: number | null): 'hot' | 'warn' | '' {
      if (h == null) return '';
      if (h >= OVERDUE_HOURS) return 'hot';
      if (h >= WARN_HOURS) return 'warn';
      return '';
    }

    const items = [
      ...causes.map((c: any) => {
        const ageHours = c.submittedAt ? Math.round((Date.now() - +new Date(c.submittedAt)) / 3600e3) : null;
        return {
          id: String(c._id),
          kind: 'cause' as const,
          title: c.title,
          publicId: c.publicId || '',
          category: c.category,
          gradient: c.gradient,
          status: c.status,
          submittedAt: c.submittedAt,
          ageHours,
          ageTone: toAgeTone(ageHours),
          organization: orgMap.get(String(c.organizationId)) ? { id: String(c.organizationId), name: (orgMap.get(String(c.organizationId)) as any).name } : null,
          assignedReviewer: c.assignedReviewerId && revMap.get(String(c.assignedReviewerId)) ? { id: String(c.assignedReviewerId), name: (revMap.get(String(c.assignedReviewerId)) as any).name } : null,
        };
      }),
      ...updates.map((u: any) => {
        const ageHours = u.submittedAt ? Math.round((Date.now() - +new Date(u.submittedAt)) / 3600e3) : null;
        return {
          id: String(u._id),
          kind: 'update' as const,
          title: u.title,
          gradient: '',
          status: u.status,
          submittedAt: u.submittedAt,
          ageHours,
          ageTone: toAgeTone(ageHours),
          organization: orgMap.get(String(u.organizationId)) ? { id: String(u.organizationId), name: (orgMap.get(String(u.organizationId)) as any).name } : null,
          assignedReviewer: u.assignedReviewerId && revMap.get(String(u.assignedReviewerId)) ? { id: String(u.assignedReviewerId), name: (revMap.get(String(u.assignedReviewerId)) as any).name } : null,
        };
      }),
    ].sort((a, b) => (+new Date(a.submittedAt || 0)) - (+new Date(b.submittedAt || 0)));

    const metrics = {
      open: items.length,
      unassigned: items.filter((i) => !i.assignedReviewer).length,
      overdue: items.filter((i) => i.ageTone === 'hot').length,
      changes: items.filter((i) => i.status === 'changes').length,
    };

    return ok({ items, metrics });
  }) as unknown as NextResponse;
}
