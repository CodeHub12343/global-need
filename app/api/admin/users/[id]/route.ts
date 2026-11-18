import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, logAudit } from '@/lib/models';
import { ok, notFound, fail, withErrors, parseJSON } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { userPatchSchema } from '@/lib/validation/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const admin = await requireAdmin();
    if (admin instanceof Response) return admin;
    await connectDB();
    const input = await parseJSON(req, userPatchSchema);
    const target = await User.findById(params.id);
    if (!target) return notFound('User not found');
    if (String(target._id) === admin.id && (input.role === 'supporter' || input.status === 'suspended')) {
      return fail('You cannot demote or suspend your own account', 409);
    }
    const before: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      if (v === undefined) continue;
      before[k] = (target as any)[k];
      if (k === 'organizationId') (target as any)[k] = v || null;
      else (target as any)[k] = v;
    }
    await target.save();
    await logAudit({
      actorId: admin.id as any, actorName: admin.name, actorRole: admin.role,
      action: 'admin.user.patch', label: 'Updated user',
      subjectType: 'user', subjectId: target._id, subjectDescription: `${target.name} (${target.email})`,
      metadata: { before, after: input },
    });
    return ok({ id: String(target._id), ...input });
  }) as unknown as NextResponse;
}
