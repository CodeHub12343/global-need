import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category, Cause, logAudit } from '@/lib/models';
import { ok, notFound, conflict, withErrors, parseJSON } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { categoryPatchSchema } from '@/lib/validation/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const input = await parseJSON(req, categoryPatchSchema);
    const cat = await Category.findById(params.id);
    if (!cat) return notFound('Category not found');
    const before: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      if (v === undefined) continue;
      before[k] = (cat as any)[k];
      (cat as any)[k] = v;
    }
    await cat.save();
    await logAudit({
      actorId: user.id as any, actorName: user.name, actorRole: user.role,
      action: 'admin.category.patch', label: 'Updated category',
      subjectType: 'category', subjectId: cat._id, subjectDescription: cat.name,
      metadata: { before, after: input },
    });
    return ok({ id: String(cat._id), ...input });
  }) as unknown as NextResponse;
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const cat = await Category.findById(params.id);
    if (!cat) return notFound('Category not found');
    const inUse = await Cause.countDocuments({ category: cat.slug });
    if (inUse > 0) return conflict(`Category is used by ${inUse} cause(s). Reassign them first.`);
    await Category.deleteOne({ _id: cat._id });
    await logAudit({
      actorId: user.id as any, actorName: user.name, actorRole: user.role,
      action: 'admin.category.delete', label: 'Deleted category',
      subjectType: 'category', subjectId: cat._id, subjectDescription: cat.name,
    });
    return ok({ id: String(cat._id), deleted: true });
  }) as unknown as NextResponse;
}
