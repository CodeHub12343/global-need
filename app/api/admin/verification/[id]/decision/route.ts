import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Organization, Review, logAudit } from '@/lib/models';
import { ok, notFound, withErrors, parseJSON } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { orgDecisionSchema } from '@/lib/validation/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const input = await parseJSON(req, orgDecisionSchema);
    const org = await Organization.findById(params.id);
    if (!org) return notFound('Organization not found');

    const now = new Date();
    if (input.action === 'verify') {
      org.status = 'verified';
      org.verifiedAt = now;
      org.verifiedById = user.id as any;
      if (input.checklist) org.checksPassed = input.checklist.filter((c) => c.checked).length;
    } else if (input.action === 'reject') {
      org.status = 'rejected';
    } // request_info: leave pending

    await org.save();

    await Review.create({
      subjectType: 'organization',
      subjectId: org._id,
      reviewerId: user.id,
      action: input.action === 'verify' ? 'verify' : input.action === 'request_info' ? 'request_info' : 'reject',
      reason: input.reason || '',
      internalNotes: input.internalNotes || '',
      checklist: input.checklist || [],
    });

    await logAudit({
      actorId: user.id as any, actorName: user.name, actorRole: user.role,
      action: `admin.verification.${input.action}`,
      label: input.action === 'verify' ? 'Verified organization' : input.action === 'reject' ? 'Rejected organization' : 'Requested info from organization',
      subjectType: 'organization', subjectId: org._id, subjectDescription: org.name,
      metadata: { reason: input.reason },
    });

    return ok({ id: String(org._id), status: org.status });
  }) as unknown as NextResponse;
}
