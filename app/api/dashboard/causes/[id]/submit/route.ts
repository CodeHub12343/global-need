import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Cause } from '@/lib/models';
import { ok, fail, notFound, withErrors } from '@/lib/api';
import { requireOrgMember } from '@/lib/dashboard-auth';
import { shapeCauseRow } from '@/lib/dashboard-shape';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Cause not found');
    await connectDB();
    const cause = await Cause.findOne({ _id: params.id, organizationId: ctx.orgId });
    if (!cause) return notFound('Cause not found');
    if (!['draft', 'changes'].includes(cause.status)) {
      return fail('Cause is already in review or published', 409);
    }
    const missing: string[] = [];
    if (!cause.title || cause.title.length < 2) missing.push('title');
    if (!cause.category) missing.push('category');
    if (!cause.shortDescription) missing.push('shortDescription');
    if (!cause.story) missing.push('story');
    if (!cause.need) missing.push('need');
    if (!cause.intendedUse) missing.push('intendedUse');
    if (!cause.country) missing.push('country');
    if (missing.length) return fail('Complete these fields before submitting', 422, { missing });

    cause.status = 'pending';
    cause.submittedAt = new Date();
    cause.lastUpdatedAt = new Date();
    if (!cause.publicId) {
      cause.publicId = `MGN-${new Date().getFullYear().toString().slice(2)}-${Date.now().toString().slice(-4).padStart(4, '0')}`;
    }
    await cause.save();
    await logAudit({
      actorId: ctx.user.id as any,
      actorName: ctx.user.name,
      actorRole: ctx.user.role,
      action: 'cause.submitted',
      label: 'Cause submitted for review',
      subjectType: 'cause',
      subjectId: cause._id as any,
      subjectDescription: cause.title,
      metadata: { organizationId: String(ctx.orgId) },
    });
    return ok(shapeCauseRow(cause.toObject()));
  }) as unknown as NextResponse;
}
