import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cause, Organization } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { shapeCausePublic } from '@/lib/public-shape';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withErrors(async () => {
    await connectDB();
    const url = new URL(req.url);
    const limit = Math.min(12, Math.max(1, parseInt(url.searchParams.get('limit') || '6', 10) || 6));

    let rows = await Cause.find({ status: 'approved', featured: true })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .populate({ path: 'organizationId', model: Organization })
      .lean();

    if (rows.length < limit) {
      const fillerIds = rows.map((r: any) => r._id);
      const filler = await Cause.find({
        status: 'approved',
        _id: { $nin: fillerIds },
      })
        .sort({ publishedAt: -1 })
        .limit(limit - rows.length)
        .populate({ path: 'organizationId', model: Organization })
        .lean();
      rows = rows.concat(filler as any);
    }

    return ok(rows.map((c: any) => shapeCausePublic(c, c.organizationId)));
  }) as unknown as NextResponse;
}
