import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cause, logAudit } from '@/lib/models';
import { ok, notFound, withErrors, parseJSON } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { causePatchSchema } from '@/lib/validation/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const input = await parseJSON(req, causePatchSchema);
    const cause = await Cause.findById(params.id);
    if (!cause) return notFound('Cause not found');
    const before: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      if (v === undefined) continue;
      before[k] = (cause as any)[k];
      if (k === 'assignedReviewerId') (cause as any)[k] = v || null;
      else (cause as any)[k] = v;
    }
    cause.lastUpdatedAt = new Date();
    await cause.save();
    await logAudit({
      actorId: user.id as any, actorName: user.name, actorRole: user.role,
      action: 'admin.cause.patch', label: 'Updated cause',
      subjectType: 'cause', subjectId: cause._id, subjectDescription: cause.title,
      metadata: { before, after: input },
    });
    return ok({ id: String(cause._id), ...input });
  }) as unknown as NextResponse;
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const cause = await Cause.findById(params.id);
    if (!cause) return notFound('Cause not found');
    const title = cause.title;
    await Cause.deleteOne({ _id: cause._id });
    await logAudit({
      actorId: user.id as any, actorName: user.name, actorRole: user.role,
      action: 'admin.cause.delete', label: 'Deleted cause',
      subjectType: 'cause', subjectId: cause._id, subjectDescription: title,
    });
    return ok({ id: String(cause._id), deleted: true });
  }) as unknown as NextResponse;
}
