import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Inquiry, User } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireOrgMember } from '@/lib/dashboard-auth';
import { shapeInquiryListItem } from '@/lib/dashboard-shape';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    const { orgId } = ctx;
    await connectDB();
    const url = new URL(req.url);
    const tab = url.searchParams.get('tab') || 'all'; // all | unread | awaiting | resolved | volunteer | partnership
    const q = (url.searchParams.get('q') || '').trim();

    const filter: any = { organizationId: orgId };
    if (tab === 'unread') filter.unreadForOrg = true;
    else if (tab === 'awaiting') filter.status = { $in: ['new', 'waiting'] };
    else if (tab === 'resolved') filter.status = 'resolved';
    else if (tab === 'volunteer') filter.type = 'volunteer';
    else if (tab === 'partnership') filter.type = 'partnership';
    if (q) {
      const r = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ subject: r }, { fromName: r }, { fromEmail: r }];
    }

    const rows = await Inquiry.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    const assigneeIds = Array.from(new Set(rows.map((r: any) => r.assigneeId).filter(Boolean).map(String)));
    const assignees = assigneeIds.length ? await User.find({ _id: { $in: assigneeIds } }, { name: 1 }).lean() : [];
    const amap = new Map(assignees.map((u: any) => [String(u._id), u]));

    const unreadCount = await Inquiry.countDocuments({ organizationId: orgId, unreadForOrg: true });
    const awaitingCount = await Inquiry.countDocuments({ organizationId: orgId, status: { $in: ['new', 'waiting'] } });

    return ok({
      items: rows.map((r: any) => shapeInquiryListItem(r, r.assigneeId ? amap.get(String(r.assigneeId)) : undefined)),
      counts: {
        total: rows.length,
        unread: unreadCount,
        awaiting: awaitingCount,
      },
    });
  }) as unknown as NextResponse;
}
