import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireReviewer } from '@/lib/reviewer-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return withErrors(async () => {
    const user = await requireReviewer();
    if (user instanceof Response) return user;
    await connectDB();
    const rows = await User.find({ role: { $in: ['reviewer', 'senior_reviewer'] }, status: 'active' }, { name: 1, role: 1 }).lean();
    return ok(rows.map((u: any) => ({ id: String(u._id), name: u.name, role: u.role })));
  }) as unknown as NextResponse;
}
