import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Inquiry, logAudit } from '@/lib/models';
import { ok, notFound, withErrors, parseJSON } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { inquiryPatchSchema } from '@/lib/validation/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const admin = await requireAdmin();
    if (admin instanceof Response) return admin;
    await connectDB();
    const input = await parseJSON(req, inquiryPatchSchema);
    const inq = await Inquiry.findById(params.id);
    if (!inq) return notFound('Inquiry not found');
    const before: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      if (v === undefined) continue;
      before[k] = (inq as any)[k];
      if (k === 'assigneeId') (inq as any)[k] = v || null;
      else (inq as any)[k] = v;
    }
    if (input.status === 'resolved' && !inq.resolvedAt) inq.resolvedAt = new Date();
    await inq.save();
    await logAudit({
      actorId: admin.id as any, actorName: admin.name, actorRole: admin.role,
      action: 'admin.inquiry.patch', label: 'Updated inquiry',
      subjectType: 'inquiry', subjectId: inq._id, subjectDescription: inq.subject,
      metadata: { before, after: input },
    });
    return ok({ id: String(inq._id), ...input });
  }) as unknown as NextResponse;
}
