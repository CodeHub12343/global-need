import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { ok, parseJSON, withErrors, notFound } from '@/lib/api';
import { requireUser } from '@/lib/session';
import { accountUpdateSchema } from '@/lib/validation/dashboard';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function shapeAccount(u: any) {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    emailVerified: !!u.emailVerified,
    phone: u.phone || '',
    country: u.country || '',
    twoFactorEnabled: !!u.twoFactorEnabled,
    lastSignInAt: u.lastSignInAt || null,
    createdAt: u.createdAt,
  };
}

export async function GET() {
  return withErrors(async () => {
    const user = await requireUser();
    if (user instanceof Response) return user;
    await connectDB();
    const u = await User.findById(user.id).lean();
    if (!u) return notFound('Account not found');
    return ok(shapeAccount(u));
  }) as unknown as NextResponse;
}

export async function PATCH(req: Request) {
  return withErrors(async () => {
    const user = await requireUser();
    if (user instanceof Response) return user;
    const input = await parseJSON(req, accountUpdateSchema);
    await connectDB();
    const u = await User.findById(user.id);
    if (!u) return notFound('Account not found');
    if (input.name) u.name = input.name;
    if (input.phone !== undefined) u.phone = input.phone || undefined;
    if (input.country !== undefined) u.country = input.country || undefined;
    await u.save();
    await logAudit({
      actorId: user.id as any,
      actorName: user.name,
      actorRole: user.role,
      action: 'account.updated',
      label: 'Account settings updated',
      subjectType: 'user',
      subjectId: u._id as any,
      subjectDescription: u.email,
    });
    return ok(shapeAccount(u.toObject()));
  }) as unknown as NextResponse;
}
