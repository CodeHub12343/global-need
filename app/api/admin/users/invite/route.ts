import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { User, logAudit } from '@/lib/models';
import { ok, conflict, withErrors, parseJSON } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { userInviteSchema } from '@/lib/validation/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return withErrors(async () => {
    const admin = await requireAdmin();
    if (admin instanceof Response) return admin;
    await connectDB();
    const input = await parseJSON(req, userInviteSchema);

    const existing = await User.findOne({ email: input.email });
    if (existing) return conflict('A user with that email already exists');

    const tempPassword = crypto.randomBytes(12).toString('base64url');
    const hash = await bcrypt.hash(tempPassword, 12);
    const created = await User.create({
      name: input.name,
      email: input.email,
      passwordHash: hash,
      role: input.role,
      status: 'pending',
      organizationId: input.organizationId || undefined,
      reviewerCapabilities: input.reviewerCapabilities || [],
      emailVerified: false,
    });

    await logAudit({
      actorId: admin.id as any, actorName: admin.name, actorRole: admin.role,
      action: 'admin.user.invite', label: 'Invited user',
      subjectType: 'user', subjectId: created._id, subjectDescription: `${created.name} (${created.email}) · ${created.role}`,
    });

    return ok({ id: String(created._id), tempPassword });
  }) as unknown as NextResponse;
}
