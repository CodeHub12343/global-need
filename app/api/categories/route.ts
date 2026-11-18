import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category, Cause } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return withErrors(async () => {
    await connectDB();
    const [cats, counts] = await Promise.all([
      Category.find({ active: true }).sort({ order: 1, name: 1 }).lean(),
      Cause.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);
    const map = new Map<string, number>(counts.map((c: any) => [c._id, c.count]));
    return ok(
      cats.map((c: any) => ({
        id: String(c._id),
        slug: c.slug,
        name: c.name,
        description: c.description || '',
        icon: c.icon || 'heart',
        order: c.order || 0,
        causeCount: map.get(c.slug) || 0,
      })),
    );
  }) as unknown as NextResponse;
}
