import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category, logAudit } from '@/lib/models';
import { ok, withErrors, parseJSON } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { categoryReorderSchema } from '@/lib/validation/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const input = await parseJSON(req, categoryReorderSchema);
    for (let i = 0; i < input.order.length; i++) {
      await Category.updateOne({ _id: input.order[i] }, { $set: { order: i } });
    }
    await logAudit({
      actorId: user.id as any, actorName: user.name, actorRole: user.role,
      action: 'admin.category.reorder', label: 'Reordered categories',
      subjectType: 'category', metadata: { order: input.order },
    });
    return ok({ reordered: input.order.length });
  }) as unknown as NextResponse;
}
