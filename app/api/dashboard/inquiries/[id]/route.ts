import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Inquiry, User, Cause } from '@/lib/models';
import { ok, notFound, parseJSON, withErrors } from '@/lib/api';
import { requireOrgMember } from '@/lib/dashboard-auth';
import { inquiryPatchSchema } from '@/lib/validation/dashboard';
import { shapeInquiryFull } from '@/lib/dashboard-shape';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Inquiry not found');
    await connectDB();
    const inq = await Inquiry.findOne({ _id: params.id, organizationId: ctx.orgId }).lean();
    if (!inq) return notFound('Inquiry not found');
    const [assignee, cause] = await Promise.all([
      (inq as any).assigneeId ? User.findById((inq as any).assigneeId, { name: 1 }).lean() : null,
      (inq as any).causeId ? Cause.findById((inq as any).causeId, { title: 1, slug: 1 }).lean() : null,
    ]);
    return ok(shapeInquiryFull(inq, assignee as any, cause as any));
  }) as unknown as NextResponse;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Inquiry not found');
    const input = await parseJSON(req, inquiryPatchSchema);
    await connectDB();
    const inq = await Inquiry.findOne({ _id: params.id, organizationId: ctx.orgId });
    if (!inq) return notFound('Inquiry not found');

    if (input.status) {
      inq.status = input.status;
      if (input.status === 'resolved') inq.resolvedAt = new Date();
    }
    if (input.assigneeId !== undefined) {
      inq.assigneeId = input.assigneeId ? (input.assigneeId as any) : (undefined as any);
    }
    if (input.tags) inq.tags = input.tags;
    if (input.markRead) inq.unreadForOrg = false;
    await inq.save();
    await logAudit({
      actorId: ctx.user.id as any,
      actorName: ctx.user.name,
      actorRole: ctx.user.role,
      action: 'inquiry.updated',
      label: 'Inquiry updated',
      subjectType: 'inquiry',
      subjectId: inq._id as any,
      subjectDescription: inq.subject,
      metadata: { organizationId: String(ctx.orgId), changes: input },
    });
    const [assignee, cause] = await Promise.all([
      inq.assigneeId ? User.findById(inq.assigneeId, { name: 1 }).lean() : null,
      inq.causeId ? Cause.findById(inq.causeId, { title: 1, slug: 1 }).lean() : null,
    ]);
    return ok(shapeInquiryFull(inq.toObject(), assignee as any, cause as any));
  }) as unknown as NextResponse;
}
