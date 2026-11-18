import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cause, Organization, Inquiry } from '@/lib/models';
import { created, fail, parseJSON, withErrors } from '@/lib/api';
import { publicInquirySchema } from '@/lib/validation/inquiries';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return withErrors(async () => {
    const input = await parseJSON(req, publicInquirySchema);
    await connectDB();

    let causeDoc: any = null;
    let orgDoc: any = null;

    if (input.scope === 'cause') {
      if (!input.causeSlug) return fail('Cause reference missing', 400);
      causeDoc = await Cause.findOne({ slug: input.causeSlug, status: 'approved' }).lean();
      if (!causeDoc) return fail('Cause not found', 404);
      orgDoc = await Organization.findById(causeDoc.organizationId).lean();
    } else if (input.scope === 'organization') {
      if (!input.organizationSlug) return fail('Organization reference missing', 400);
      orgDoc = await Organization.findOne({ slug: input.organizationSlug, status: 'verified' }).lean();
      if (!orgDoc) return fail('Organization not found', 404);
    }

    const subject =
      input.subject?.trim() ||
      (causeDoc
        ? `Inquiry about ${causeDoc.title}`
        : orgDoc
          ? `Inquiry for ${orgDoc.name}`
          : `New inquiry from ${input.name}`);

    const inquiry = await Inquiry.create({
      fromName: input.name.trim(),
      fromEmail: input.email.toLowerCase().trim(),
      phone: input.phone || undefined,
      type: input.type,
      scope: input.scope,
      causeId: causeDoc?._id,
      organizationId: orgDoc?._id,
      subject,
      initialBody: input.message,
      status: 'new',
      messages: [
        {
          senderName: input.name.trim(),
          senderRole: 'public',
          body: input.message,
          at: new Date(),
        },
      ],
      unreadForOrg: true,
    });

    if (causeDoc) {
      await Cause.updateOne({ _id: causeDoc._id }, { $inc: { inquiriesCount: 1 } });
    }

    await logAudit({
      actorName: input.name.trim(),
      actorRole: 'public',
      action: 'inquiry.created',
      label: 'Public inquiry submitted',
      subjectType: 'inquiry',
      subjectId: inquiry._id as any,
      subjectDescription: subject,
      metadata: {
        email: input.email.toLowerCase(),
        scope: input.scope,
        causeSlug: input.causeSlug,
        organizationSlug: input.organizationSlug,
      },
    });

    return created({
      id: String(inquiry._id),
      subject,
      status: 'new',
    });
  }) as unknown as NextResponse;
}
