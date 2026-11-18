import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Organization } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireReviewer } from '@/lib/reviewer-auth';
import { shapeOrganizationPublic } from '@/lib/public-shape';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withErrors(async () => {
    const user = await requireReviewer();
    if (user instanceof Response) return user;
    await connectDB();
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'pending';
    const filter: any = {};
    if (status !== 'all') filter.status = status;
    const rows = await Organization.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    return ok(rows.map(shapeOrganizationPublic as any));
  }) as unknown as NextResponse;
}
