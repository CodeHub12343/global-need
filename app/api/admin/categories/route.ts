import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category, Cause, logAudit } from '@/lib/models';
import { ok, conflict, withErrors, parseJSON } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { categorySchema } from '@/lib/validation/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const rows = await Category.find({}).sort({ order: 1, createdAt: 1 }).lean();
    const counts = await Cause.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }]);
    const countMap = new Map(counts.map((c: any) => [c._id, c.n]));
    return ok(rows.map((c: any) => ({
      id: String(c._id),
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      order: c.order,
      active: c.active,
      count: countMap.get(c.slug) || 0,
    })));
  }) as unknown as NextResponse;
}

export async function POST(req: Request) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const input = await parseJSON(req, categorySchema);
    const existing = await Category.findOne({ slug: input.slug });
    if (existing) return conflict('Slug already in use');
    const count = await Category.countDocuments({});
    const created = await Category.create({
      name: input.name,
      slug: input.slug,
      description: input.description || '',
      icon: input.icon || 'heart',
      order: count,
      active: input.active ?? false,
      createdById: user.id,
    });
    await logAudit({
      actorId: user.id as any, actorName: user.name, actorRole: user.role,
      action: 'admin.category.create', label: 'Created category',
      subjectType: 'category', subjectId: created._id, subjectDescription: created.name,
    });
    return ok({ id: String(created._id), ...input });
  }) as unknown as NextResponse;
}
