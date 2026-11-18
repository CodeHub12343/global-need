import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Organization, DocumentFile, User, logAudit } from '@/lib/models';
import { ok, notFound, withErrors } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const org = await Organization.findById(params.id).lean();
    if (!org) return notFound('Organization not found');

    const [docs, contact] = await Promise.all([
      DocumentFile.find({ organizationId: (org as any)._id, causeId: { $exists: false } }).sort({ createdAt: -1 }).lean(),
      (org as any).adminIds?.[0] ? User.findById((org as any).adminIds[0], { name: 1, email: 1 }).lean() : null,
    ]);

    // Log private-doc list view
    await logAudit({
      actorId: user.id as any, actorName: user.name, actorRole: user.role,
      action: 'admin.verification.view', label: 'Viewed verification record',
      subjectType: 'organization', subjectId: (org as any)._id, subjectDescription: (org as any).name,
      metadata: { docsCount: docs.length },
    });

    return ok({
      organization: {
        id: String((org as any)._id),
        name: (org as any).name,
        type: (org as any).type,
        category: (org as any).category,
        country: (org as any).country,
        city: (org as any).city,
        operatingSince: (org as any).operatingSince,
        publicEmail: (org as any).publicEmail,
        shortDescription: (org as any).shortDescription,
        description: (org as any).description,
        submittedAt: (org as any).createdAt,
        daysWaiting: (org as any).createdAt ? Math.max(0, Math.floor((Date.now() - +new Date((org as any).createdAt)) / 86400e3)) : 0,
        status: (org as any).status,
        gradient: (org as any).gradient,
      },
      contact: contact ? { name: (contact as any).name, email: (contact as any).email } : null,
      documents: docs.map((d: any) => ({
        id: String(d._id),
        filename: d.originalName || d.filename,
        size: d.size,
        type: d.type,
        isPrivate: d.isPrivate,
        consentLogAttached: d.consentLogAttached,
        mimeType: d.mimeType,
        createdAt: d.createdAt,
      })),
    });
  }) as unknown as NextResponse;
}
