import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Organization, DocumentFile } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();

    const orgs = await Organization.find({ status: 'pending' }).sort({ createdAt: 1 }).lean();
    const orgIds = orgs.map((o: any) => o._id);
    const docCounts = orgIds.length
      ? await DocumentFile.aggregate([{ $match: { organizationId: { $in: orgIds }, causeId: { $exists: false } } }, { $group: { _id: '$organizationId', count: { $sum: 1 } } }])
      : [];
    const docMap = new Map(docCounts.map((c: any) => [String(c._id), c.count]));

    const items = orgs.map((o: any) => ({
      id: String(o._id),
      name: o.name,
      gradient: o.gradient,
      initial: (o.initial || o.name?.[0] || '?').toUpperCase(),
      category: o.category,
      country: o.country,
      submittedAt: o.createdAt,
      daysWaiting: o.createdAt ? Math.max(0, Math.floor((Date.now() - +new Date(o.createdAt)) / 86400e3)) : 0,
      docsCount: docMap.get(String(o._id)) || 0,
    }));

    return ok({ items });
  }) as unknown as NextResponse;
}
