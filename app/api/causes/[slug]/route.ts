import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cause, Organization, ProgressUpdate } from '@/lib/models';
import { ok, notFound, withErrors } from '@/lib/api';
import { shapeCausePublic, shapeUpdatePublic } from '@/lib/public-shape';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  return withErrors(async () => {
    await connectDB();
    const cause = await Cause.findOne({ slug: params.slug, status: 'approved' })
      .populate({ path: 'organizationId', model: Organization })
      .lean();
    if (!cause) return notFound('Cause not found');

    Cause.updateOne({ _id: (cause as any)._id }, { $inc: { views: 1 } }).catch(() => {});

    const updates = await ProgressUpdate.find({
      causeId: (cause as any)._id,
      status: 'approved',
    })
      .sort({ approvedAt: -1, createdAt: -1 })
      .limit(20)
      .lean();

    const org = (cause as any).organizationId;

    return ok({
      cause: shapeCausePublic(cause as any, org),
      updates: updates.map((u: any) => shapeUpdatePublic(u, cause as any, org)),
    });
  }) as unknown as NextResponse;
}
