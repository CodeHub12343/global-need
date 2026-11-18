import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Inquiry } from '@/lib/models';
import { created, notFound, parseJSON, withErrors } from '@/lib/api';
import { requireOrgMember } from '@/lib/dashboard-auth';
import { inquiryReplySchema } from '@/lib/validation/dashboard';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Inquiry not found');
    const input = await parseJSON(req, inquiryReplySchema);
    await connectDB();
    const inq = await Inquiry.findOne({ _id: params.id, organizationId: ctx.orgId });
    if (!inq) return notFound('Inquiry not found');

    inq.messages.push({
      senderId: ctx.user.id as any,
      senderName: ctx.user.name,
      senderRole: ctx.user.role,
      body: input.body,
      at: new Date(),
    } as any);
    if (inq.status === 'new') inq.status = 'waiting';
    inq.unreadForOrg = false;
    await inq.save();
    await logAudit({
      actorId: ctx.user.id as any,
      actorName: ctx.user.name,
      actorRole: ctx.user.role,
      action: 'inquiry.replied',
      label: 'Inquiry reply sent',
      subjectType: 'inquiry',
      subjectId: inq._id as any,
      subjectDescription: inq.subject,
      metadata: { organizationId: String(ctx.orgId) },
    });
    const last = inq.messages[inq.messages.length - 1] as any;
    return created({
      id: String(last._id),
      senderName: last.senderName,
      senderRole: last.senderRole,
      body: last.body,
      at: last.at,
    });
  }) as unknown as NextResponse;
}
