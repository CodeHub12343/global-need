import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Organization, User } from '@/lib/models';
import { ok, notFound, parseJSON, withErrors } from '@/lib/api';
import { requireOrgMember } from '@/lib/dashboard-auth';
import { orgUpdateSchema } from '@/lib/validation/dashboard';
import { shapeOrganizationPublic } from '@/lib/public-shape';
import { logAudit } from '@/lib/models/AuditLog';
import { slugify, uniqueSlug } from '@/lib/slug';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    await connectDB();
    const org = await Organization.findById(ctx.orgId).lean();
    if (!org) return notFound('Organization not found');
    const verifier = (org as any).verifiedById ? await User.findById((org as any).verifiedById, { name: 1 }).lean() : null;
    return ok({
      organization: shapeOrganizationPublic(org as any),
      verifiedBy: verifier ? { id: String((verifier as any)._id), name: (verifier as any).name } : null,
    });
  }) as unknown as NextResponse;
}

const REVIEW_TRIGGERS = ['name', 'category', 'description', 'shortDescription'] as const;

export async function PATCH(req: Request) {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    const input = await parseJSON(req, orgUpdateSchema);
    await connectDB();
    const org = await Organization.findById(ctx.orgId);
    if (!org) return notFound('Organization not found');

    const changedFields: string[] = [];
    for (const [k, v] of Object.entries(input)) {
      if (v === undefined) continue;
      if ((org as any)[k] !== v) changedFields.push(k);
    }
    const triggersReview = changedFields.some((f) => (REVIEW_TRIGGERS as readonly string[]).includes(f));

    Object.assign(org, input);
    if (input.name && !slugify(org.slug).length) {
      org.slug = await uniqueSlug(input.name, async (s) => !!(await Organization.exists({ slug: s, _id: { $ne: org._id } })));
    }
    await org.save();
    await logAudit({
      actorId: ctx.user.id as any,
      actorName: ctx.user.name,
      actorRole: ctx.user.role,
      action: 'organization.updated',
      label: 'Organization profile updated',
      subjectType: 'organization',
      subjectId: org._id as any,
      subjectDescription: org.name,
      metadata: { organizationId: String(ctx.orgId), changedFields, triggersReview },
    });
    return ok({
      organization: shapeOrganizationPublic(org.toObject() as any),
      changedFields,
      triggersReview,
    });
  }) as unknown as NextResponse;
}
