import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Organization, Cause, ProgressUpdate } from '@/lib/models';
import { ok, notFound, withErrors } from '@/lib/api';
import { shapeOrganizationPublic, shapeCausePublic, shapeUpdatePublic } from '@/lib/public-shape';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  return withErrors(async () => {
    await connectDB();
    const org = await Organization.findOne({
      slug: params.slug,
      status: 'verified',
    }).lean();
    if (!org) return notFound('Organization not found');

    const causes = await Cause.find({
      organizationId: (org as any)._id,
      status: 'approved',
    })
      .sort({ publishedAt: -1 })
      .limit(24)
      .lean();

    const causeIds = causes.map((c: any) => c._id);
    const updates = await ProgressUpdate.find({
      causeId: { $in: causeIds },
      status: 'approved',
    })
      .sort({ approvedAt: -1, createdAt: -1 })
      .limit(8)
      .lean();

    const causeMap = new Map(causes.map((c: any) => [String(c._id), c]));

    return ok({
      organization: {
        ...shapeOrganizationPublic(org as any),
        publishedCauses: causes.length,
      },
      causes: causes.map((c: any) => shapeCausePublic(c, org as any)),
      updates: updates.map((u: any) =>
        shapeUpdatePublic(u, causeMap.get(String(u.causeId)) as any, org as any),
      ),
    });
  }) as unknown as NextResponse;
}
