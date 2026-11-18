import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ProgressUpdate, Cause, Organization, User } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const url = new URL(req.url);
    const tab = url.searchParams.get('tab') || 'pending';

    const filter: any = {};
    if (tab === 'pending') filter.status = 'pending';
    else if (tab === 'flagged') { filter.status = 'pending'; filter.flagged = true; }
    else if (tab === 'changes') filter.status = 'changes';
    else if (tab === 'today') {
      filter.status = 'approved';
      filter.approvedAt = { $gte: new Date(Date.now() - 86400e3) };
    }

    const rows = await ProgressUpdate.find(filter).sort({ submittedAt: -1 }).limit(50).lean();
    const causeIds = Array.from(new Set(rows.map((u: any) => String(u.causeId))));
    const orgIds = Array.from(new Set(rows.map((u: any) => String(u.organizationId))));
    const authorIds = Array.from(new Set(rows.map((u: any) => String(u.authorId))));
    const [causes, orgs, authors] = await Promise.all([
      causeIds.length ? Cause.find({ _id: { $in: causeIds } }, { title: 1, slug: 1 }).lean() : [],
      orgIds.length ? Organization.find({ _id: { $in: orgIds } }, { name: 1 }).lean() : [],
      authorIds.length ? User.find({ _id: { $in: authorIds } }, { name: 1 }).lean() : [],
    ]);
    const causeMap = new Map(causes.map((c: any) => [String(c._id), c]));
    const orgMap = new Map(orgs.map((o: any) => [String(o._id), o]));
    const authorMap = new Map(authors.map((a: any) => [String(a._id), a]));

    const items = rows.map((u: any) => ({
      id: String(u._id),
      title: u.title,
      body: u.body,
      status: u.status,
      flagged: !!u.flagged,
      flagReason: u.flagReason,
      consentLogAttached: u.consentLogAttached,
      mediaCount: (u.media || []).length,
      submittedAt: u.submittedAt,
      approvedAt: u.approvedAt,
      cause: causeMap.get(String(u.causeId)) ? { id: String(u.causeId), title: (causeMap.get(String(u.causeId)) as any).title, slug: (causeMap.get(String(u.causeId)) as any).slug } : null,
      organization: orgMap.get(String(u.organizationId)) ? { id: String(u.organizationId), name: (orgMap.get(String(u.organizationId)) as any).name } : null,
      author: authorMap.get(String(u.authorId)) ? { name: (authorMap.get(String(u.authorId)) as any).name } : null,
    }));

    const [pendingCount, flaggedCount, changesCount, todayCount] = await Promise.all([
      ProgressUpdate.countDocuments({ status: 'pending' }),
      ProgressUpdate.countDocuments({ status: 'pending', flagged: true }),
      ProgressUpdate.countDocuments({ status: 'changes' }),
      ProgressUpdate.countDocuments({ status: 'approved', approvedAt: { $gte: new Date(Date.now() - 86400e3) } }),
    ]);

    return ok({ items, counts: { pending: pendingCount, flagged: flaggedCount, changes: changesCount, today: todayCount } });
  }) as unknown as NextResponse;
}
