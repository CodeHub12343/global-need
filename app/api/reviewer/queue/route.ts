import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Cause, ProgressUpdate, Organization, User } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireReviewer } from '@/lib/reviewer-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OVERDUE_HOURS = 48;

export async function GET(req: Request) {
  return withErrors(async () => {
    const user = await requireReviewer();
    if (user instanceof Response) return user;
    await connectDB();
    const url = new URL(req.url);
    const subject = url.searchParams.get('subject') || 'all'; // all | cause | update
    const status = url.searchParams.get('status') || 'pending'; // pending | changes | all
    const mine = url.searchParams.get('mine') === 'true';
    const overdueOnly = url.searchParams.get('overdue') === 'true';
    const q = (url.searchParams.get('q') || '').trim();
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10) || 20));

    const base: any = {};
    if (status !== 'all') base.status = status;
    else base.status = { $in: ['pending', 'changes'] };
    if (mine) base.assignedReviewerId = new Types.ObjectId(user.id);
    if (overdueOnly) base.submittedAt = { $lte: new Date(Date.now() - OVERDUE_HOURS * 3600e3) };

    const r = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;

    type Row = {
      kind: 'cause' | 'update';
      id: string;
      title: string;
      publicId?: string;
      status: string;
      category?: string;
      submittedAt: Date | null;
      ageHours: number | null;
      gradient?: string;
      organization: { id: string; name: string; gradient?: string; verified: boolean } | null;
      assignedReviewer: { id: string; name: string } | null;
      cause?: { id: string; title: string; slug: string } | null;
    };

    let items: Row[] = [];

    if (subject !== 'update') {
      const cfilter = { ...base };
      if (r) cfilter.$or = [{ title: r }, { shortDescription: r }, { publicId: r }];
      const rows = await Cause.find(cfilter).sort({ submittedAt: 1 }).limit(limit * page).lean();
      const orgIds = Array.from(new Set(rows.map((c: any) => String(c.organizationId))));
      const [orgs, reviewers] = await Promise.all([
        orgIds.length ? Organization.find({ _id: { $in: orgIds } }).lean() : [],
        rows.filter((c: any) => c.assignedReviewerId).length
          ? User.find({ _id: { $in: rows.map((c: any) => c.assignedReviewerId).filter(Boolean) } }, { name: 1 }).lean()
          : [],
      ]);
      const orgMap = new Map(orgs.map((o: any) => [String(o._id), o]));
      const revMap = new Map(reviewers.map((u: any) => [String(u._id), u]));
      items.push(
        ...rows.map((c: any): Row => {
          const org = orgMap.get(String(c.organizationId));
          const rev = c.assignedReviewerId ? revMap.get(String(c.assignedReviewerId)) : null;
          return {
            kind: 'cause',
            id: String(c._id),
            title: c.title,
            publicId: c.publicId || '',
            status: c.status,
            category: c.category,
            submittedAt: c.submittedAt,
            ageHours: c.submittedAt ? Math.round((Date.now() - +new Date(c.submittedAt)) / 3600e3) : null,
            gradient: c.gradient,
            organization: org ? { id: String((org as any)._id), name: (org as any).name, gradient: (org as any).gradient, verified: (org as any).status === 'verified' } : null,
            assignedReviewer: rev ? { id: String((rev as any)._id), name: (rev as any).name } : null,
          };
        }),
      );
    }

    if (subject !== 'cause') {
      const ufilter = { ...base };
      if (r) ufilter.$or = [{ title: r }, { body: r }];
      const rows = await ProgressUpdate.find(ufilter).sort({ submittedAt: 1 }).limit(limit * page).lean();
      const causeIds = Array.from(new Set(rows.map((u: any) => String(u.causeId))));
      const orgIds = Array.from(new Set(rows.map((u: any) => String(u.organizationId))));
      const [causes, orgs, reviewers] = await Promise.all([
        causeIds.length ? Cause.find({ _id: { $in: causeIds } }, { title: 1, slug: 1 }).lean() : [],
        orgIds.length ? Organization.find({ _id: { $in: orgIds } }).lean() : [],
        rows.filter((u: any) => u.assignedReviewerId).length
          ? User.find({ _id: { $in: rows.map((u: any) => u.assignedReviewerId).filter(Boolean) } }, { name: 1 }).lean()
          : [],
      ]);
      const causeMap = new Map(causes.map((c: any) => [String(c._id), c]));
      const orgMap = new Map(orgs.map((o: any) => [String(o._id), o]));
      const revMap = new Map(reviewers.map((u: any) => [String(u._id), u]));
      items.push(
        ...rows.map((u: any): Row => {
          const cause = causeMap.get(String(u.causeId));
          const org = orgMap.get(String(u.organizationId));
          const rev = u.assignedReviewerId ? revMap.get(String(u.assignedReviewerId)) : null;
          return {
            kind: 'update',
            id: String(u._id),
            title: u.title,
            status: u.status,
            submittedAt: u.submittedAt,
            ageHours: u.submittedAt ? Math.round((Date.now() - +new Date(u.submittedAt)) / 3600e3) : null,
            organization: org ? { id: String((org as any)._id), name: (org as any).name, gradient: (org as any).gradient, verified: (org as any).status === 'verified' } : null,
            assignedReviewer: rev ? { id: String((rev as any)._id), name: (rev as any).name } : null,
            cause: cause ? { id: String((cause as any)._id), title: (cause as any).title, slug: (cause as any).slug } : null,
          };
        }),
      );
    }

    items.sort((a, b) => (+new Date(a.submittedAt || 0)) - (+new Date(b.submittedAt || 0)));
    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return ok({ items: paged, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  }) as unknown as NextResponse;
}
