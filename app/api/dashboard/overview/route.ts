import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cause, ProgressUpdate, Inquiry, Organization, AuditLog } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireOrgMember } from '@/lib/dashboard-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    const { orgId } = ctx;
    await connectDB();

    const [total, published, pendingCount, changesCount, draftCount, inquiries30d, awaitingInquiries, org, recentEvents] = await Promise.all([
      Cause.countDocuments({ organizationId: orgId }),
      Cause.countDocuments({ organizationId: orgId, status: 'approved' }),
      Cause.countDocuments({ organizationId: orgId, status: 'pending' }),
      Cause.countDocuments({ organizationId: orgId, status: 'changes' }),
      Cause.countDocuments({ organizationId: orgId, status: 'draft' }),
      Inquiry.countDocuments({ organizationId: orgId, createdAt: { $gte: new Date(Date.now() - 30 * 86400e3) } }),
      Inquiry.countDocuments({ organizationId: orgId, status: { $in: ['new', 'waiting'] } }),
      Organization.findById(orgId).lean(),
      AuditLog.find({ 'metadata.organizationId': String(orgId) }).sort({ createdAt: -1 }).limit(8).lean().catch(() => []),
    ]);

    const recentUpdates = await ProgressUpdate.find({ organizationId: orgId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();
    const recentCauses = await Cause.find({ organizationId: orgId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();
    const recentInquiries = await Inquiry.find({ organizationId: orgId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    type ActivityItem = { kind: string; at: Date; title: string; meta: string };
    const activity: ActivityItem[] = [];
    for (const u of recentUpdates) {
      const label = u.status === 'approved' ? 'Progress update approved' : u.status === 'changes' ? 'Update — changes requested' : u.status === 'pending' ? 'Progress update submitted' : 'Progress update draft saved';
      activity.push({ kind: u.status === 'approved' ? 'approved' : u.status === 'changes' ? 'warning' : 'neutral', at: (u.approvedAt || u.submittedAt || u.updatedAt) as Date, title: label, meta: `"${u.title}"` });
    }
    for (const c of recentCauses) {
      const label = c.status === 'approved' ? 'Cause approved' : c.status === 'changes' ? 'Changes requested' : c.status === 'pending' ? 'Cause submitted' : c.status === 'draft' ? 'Cause draft saved' : 'Cause activity';
      activity.push({ kind: c.status === 'approved' ? 'approved' : c.status === 'changes' ? 'warning' : 'neutral', at: (c.publishedAt || c.submittedAt || c.updatedAt) as Date, title: label, meta: `"${c.title}"` });
    }
    for (const i of recentInquiries) {
      activity.push({ kind: 'neutral', at: i.createdAt as unknown as Date, title: 'New inquiry received', meta: `${i.fromName}: ${i.subject}` });
    }
    activity.sort((a, b) => +new Date(b.at) - +new Date(a.at));

    return ok({
      organization: {
        id: String((org as any)?._id || orgId),
        name: (org as any)?.name || '',
        status: (org as any)?.status || 'pending',
        verifiedAt: (org as any)?.verifiedAt || null,
        checksPassed: (org as any)?.checksPassed ?? 0,
        checksTotal: (org as any)?.checksTotal ?? 3,
      },
      metrics: {
        totalCauses: total,
        publishedCauses: published,
        pendingCauses: pendingCount,
        changesCauses: changesCount,
        draftCauses: draftCount,
        inquiries30d,
        awaitingInquiries,
      },
      activity: activity.slice(0, 8).map((a) => ({ ...a, at: a.at || null })),
    });
  }) as unknown as NextResponse;
}
