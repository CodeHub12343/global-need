import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Organization, Review } from '@/lib/models';
import { ok, notFound, parseJSON, withErrors } from '@/lib/api';
import { requireReviewer } from '@/lib/reviewer-auth';
import { orgDecisionSchema } from '@/lib/validation/reviewer';
import { shapeOrganizationPublic } from '@/lib/public-shape';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireReviewer();
    if (user instanceof Response) return user;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Organization not found');
    const input = await parseJSON(req, orgDecisionSchema);
    await connectDB();
    const org = await Organization.findById(params.id);
    if (!org) return notFound('Organization not found');

    if (input.action === 'verify') {
      org.status = 'verified';
      org.verifiedAt = new Date();
      org.verifiedById = user.id as any;
      org.checksPassed = input.checksPassed ?? 3;
    } else if (input.action === 'reject') {
      org.status = 'rejected';
    } else if (input.action === 'suspend') {
      org.status = 'suspended';
    }
    await org.save();

    await Review.create({
      subjectType: 'organization',
      subjectId: org._id,
      reviewerId: user.id,
      action: input.action === 'verify' ? 'verify' : input.action === 'reject' ? 'reject' : 'changes',
      reason: input.reason || '',
    });

    await logAudit({
      actorId: user.id as any,
      actorName: user.name,
      actorRole: user.role,
      action: `organization.${input.action}`,
      label: `Organization ${input.action}`,
      subjectType: 'organization',
      subjectId: org._id as any,
      subjectDescription: org.name,
      metadata: { reason: input.reason || null },
    });

    return ok(shapeOrganizationPublic(org.toObject() as any));
  }) as unknown as NextResponse;
}
