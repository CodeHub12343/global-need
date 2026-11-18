import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { DocumentFile } from '@/lib/models';
import { ok, notFound, withErrors } from '@/lib/api';
import { requireOrgMember } from '@/lib/dashboard-auth';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    if (!Types.ObjectId.isValid(params.id)) return notFound('Document not found');
    await connectDB();
    const doc = await DocumentFile.findOne({ _id: params.id, organizationId: ctx.orgId });
    if (!doc) return notFound('Document not found');
    await doc.deleteOne();
    await logAudit({
      actorId: ctx.user.id as any,
      actorName: ctx.user.name,
      actorRole: ctx.user.role,
      action: 'document.deleted',
      label: 'Document deleted',
      subjectType: 'document',
      subjectId: doc._id as any,
      subjectDescription: doc.originalName,
      metadata: { organizationId: String(ctx.orgId) },
    });
    return ok({ deleted: true });
  }) as unknown as NextResponse;
}
