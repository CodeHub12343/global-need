import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { DocumentFile, Cause } from '@/lib/models';
import { ok, created, fail, parseJSON, withErrors } from '@/lib/api';
import { requireOrgMember } from '@/lib/dashboard-auth';
import { docCreateSchema } from '@/lib/validation/dashboard';
import { shapeDocument } from '@/lib/dashboard-shape';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    await connectDB();
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || '';
    const causeId = url.searchParams.get('causeId') || '';
    const filter: any = { organizationId: ctx.orgId };
    if (type) filter.type = type;
    if (causeId && Types.ObjectId.isValid(causeId)) filter.causeId = new Types.ObjectId(causeId);
    const docs = await DocumentFile.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    return ok(docs.map(shapeDocument));
  }) as unknown as NextResponse;
}

export async function POST(req: Request) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    const input = await parseJSON(req, docCreateSchema);
    await connectDB();
    let causeId: Types.ObjectId | undefined;
    if (input.causeId) {
      if (!Types.ObjectId.isValid(input.causeId)) return fail('Invalid cause', 400);
      const exists = await Cause.exists({ _id: input.causeId, organizationId: ctx.orgId });
      if (!exists) return fail('Cause not found in your organization', 404);
      causeId = new Types.ObjectId(input.causeId);
    }
    const doc = await DocumentFile.create({
      organizationId: ctx.orgId,
      causeId,
      uploadedById: ctx.user.id,
      filename: input.filename,
      originalName: input.originalName,
      size: input.size,
      mimeType: input.mimeType,
      storageKey: input.storageKey,
      url: input.url,
      type: input.type,
      consentLogAttached: !!input.consentLogAttached,
      isPrivate: true,
    });
    await logAudit({
      actorId: ctx.user.id as any,
      actorName: ctx.user.name,
      actorRole: ctx.user.role,
      action: 'document.uploaded',
      label: 'Document uploaded',
      subjectType: 'document',
      subjectId: doc._id as any,
      subjectDescription: input.originalName,
      metadata: { organizationId: String(ctx.orgId), type: input.type },
    });
    return created(shapeDocument(doc.toObject()));
  }) as unknown as NextResponse;
}
