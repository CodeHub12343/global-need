import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Organization, Cause, User, logAudit } from '@/lib/models';
import { ok, notFound, withErrors, parseJSON } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { orgPatchSchema } from '@/lib/validation/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const org = await Organization.findById(params.id).lean();
    if (!org) return notFound('Organization not found');
    const [causeCount, members] = await Promise.all([
      Cause.countDocuments({ organizationId: (org as any)._id }),
      User.find({ organizationId: (org as any)._id }, { name: 1, email: 1, role: 1, status: 1 }).lean(),
    ]);
    return ok({ organization: { ...org, id: String((org as any)._id) }, causeCount, members });
  }) as unknown as NextResponse;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const input = await parseJSON(req, orgPatchSchema);
    const org = await Organization.findById(params.id);
    if (!org) return notFound('Organization not found');
    const before: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      if (v === undefined) continue;
      before[k] = (org as any)[k];
      (org as any)[k] = v;
    }
    await org.save();
    await logAudit({
      actorId: user.id as any, actorName: user.name, actorRole: user.role,
      action: 'admin.org.patch', label: 'Updated organization',
      subjectType: 'organization', subjectId: org._id, subjectDescription: org.name,
      metadata: { before, after: input },
    });
    return ok({ id: String(org._id), ...input });
  }) as unknown as NextResponse;
}
