import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Organization, User } from '@/lib/models';
import { ok, fail, notFound, parseJSON, withErrors } from '@/lib/api';
import { requireOrgAdmin } from '@/lib/dashboard-auth';
import { teamPatchSchema } from '@/lib/validation/dashboard';
import { shapeTeamMember } from '@/lib/dashboard-shape';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const ctx = await requireOrgAdmin();
    if (ctx instanceof Response) return ctx;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Member not found');
    const input = await parseJSON(req, teamPatchSchema);
    await connectDB();
    const u = await User.findOne({ _id: params.id, organizationId: ctx.orgId });
    if (!u) return notFound('Member not found');
    if (input.role && input.role !== u.role) {
      u.role = input.role;
      await u.save();
      await Organization.updateOne({ _id: ctx.orgId }, {
        $pull: { adminIds: u._id, memberIds: u._id },
      });
      await Organization.updateOne({ _id: ctx.orgId }, {
        $addToSet: input.role === 'org_admin' ? { adminIds: u._id } : { memberIds: u._id },
      });
      await logAudit({
        actorId: ctx.user.id as any,
        actorName: ctx.user.name,
        actorRole: ctx.user.role,
        action: 'team.role_changed',
        label: 'Team member role changed',
        subjectType: 'user',
        subjectId: u._id as any,
        subjectDescription: u.email,
        metadata: { organizationId: String(ctx.orgId), newRole: input.role },
      });
    }
    return ok(shapeTeamMember(u.toObject()));
  }) as unknown as NextResponse;
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const ctx = await requireOrgAdmin();
    if (ctx instanceof Response) return ctx;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Member not found');
    if (params.id === ctx.user.id) return fail('You can’t remove yourself', 409);
    await connectDB();
    const u = await User.findOne({ _id: params.id, organizationId: ctx.orgId });
    if (!u) return notFound('Member not found');
    u.organizationId = undefined as any;
    u.role = 'supporter';
    await u.save();
    await Organization.updateOne({ _id: ctx.orgId }, { $pull: { adminIds: u._id, memberIds: u._id } });
    await logAudit({
      actorId: ctx.user.id as any,
      actorName: ctx.user.name,
      actorRole: ctx.user.role,
      action: 'team.removed',
      label: 'Team member removed',
      subjectType: 'user',
      subjectId: u._id as any,
      subjectDescription: u.email,
      metadata: { organizationId: String(ctx.orgId) },
    });
    return ok({ removed: true });
  }) as unknown as NextResponse;
}
