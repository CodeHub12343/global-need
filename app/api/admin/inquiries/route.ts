import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Inquiry, Organization, User } from '@/lib/models';
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
    const tab = url.searchParams.get('tab') || 'all';
    const q = (url.searchParams.get('q') || '').trim();

    const filter: any = {};
    if (tab === 'unassigned') filter.assigneeId = { $exists: false };
    else if (tab === 'waiting') filter.status = 'waiting';
    else if (tab === 'flagged') filter.status = 'flagged';
    else if (tab === 'resolved') filter.status = 'resolved';
    if (q) {
      const r = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ subject: r }, { fromName: r }, { fromEmail: r }];
    }

    const rows = await Inquiry.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const orgIds = Array.from(new Set(rows.map((i: any) => i.organizationId).filter(Boolean).map(String)));
    const assigneeIds = Array.from(new Set(rows.map((i: any) => i.assigneeId).filter(Boolean).map(String)));
    const [orgs, assignees] = await Promise.all([
      orgIds.length ? Organization.find({ _id: { $in: orgIds } }, { name: 1 }).lean() : [],
      assigneeIds.length ? User.find({ _id: { $in: assigneeIds } }, { name: 1 }).lean() : [],
    ]);
    const orgMap = new Map(orgs.map((o: any) => [String(o._id), o]));
    const aMap = new Map(assignees.map((u: any) => [String(u._id), u]));

    const items = rows.map((i: any) => ({
      id: String(i._id),
      fromName: i.fromName,
      fromEmail: i.fromEmail,
      subject: i.subject,
      type: i.type,
      scope: i.scope,
      status: i.status,
      createdAt: i.createdAt,
      unreadForOrg: !!i.unreadForOrg,
      initial: (i.fromName?.[0] || '?').toUpperCase(),
      organization: i.organizationId && orgMap.get(String(i.organizationId)) ? { id: String(i.organizationId), name: (orgMap.get(String(i.organizationId)) as any).name } : null,
      assignee: i.assigneeId && aMap.get(String(i.assigneeId)) ? { id: String(i.assigneeId), name: (aMap.get(String(i.assigneeId)) as any).name } : null,
    }));

    const [total30, unassigned, waiting24, avgReplyHours] = await Promise.all([
      Inquiry.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 86400e3) } }),
      Inquiry.countDocuments({ assigneeId: { $exists: false }, status: { $in: ['new', 'waiting'] } }),
      Inquiry.countDocuments({ status: { $in: ['new', 'waiting'] }, createdAt: { $lte: new Date(Date.now() - 86400e3) } }),
      (async () => {
        const recent = await Inquiry.find({ 'messages.0': { $exists: true } }, { createdAt: 1, messages: 1 }).sort({ createdAt: -1 }).limit(50).lean();
        const diffs: number[] = [];
        for (const r of recent) {
          const firstReply = (r as any).messages?.find((m: any) => m.senderRole !== 'public');
          if (firstReply) {
            const d = (+new Date(firstReply.at) - +new Date((r as any).createdAt)) / 3600e3;
            if (d >= 0 && d < 24 * 30) diffs.push(d);
          }
        }
        return diffs.length ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : null;
      })(),
    ]);

    return ok({ items, metrics: { total30, unassigned, waiting24, avgReplyHours } });
  }) as unknown as NextResponse;
}
