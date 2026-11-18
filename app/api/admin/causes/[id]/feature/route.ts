import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Cause, logAudit } from '@/lib/models';
import { ok, notFound, withErrors, parseJSON } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const { featured } = await parseJSON(req, z.object({ featured: z.boolean() }));
    const cause = await Cause.findById(params.id);
    if (!cause) return notFound('Cause not found');
    cause.featured = featured;
    await cause.save();
    await logAudit({
      actorId: user.id as any, actorName: user.name, actorRole: user.role,
      action: featured ? 'admin.cause.feature' : 'admin.cause.unfeature',
      label: featured ? 'Featured cause' : 'Unfeatured cause',
      subjectType: 'cause', subjectId: cause._id, subjectDescription: cause.title,
    });
    return ok({ id: String(cause._id), featured });
  }) as unknown as NextResponse;
}
