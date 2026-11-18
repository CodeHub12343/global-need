import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { ok, fail, parseJSON, withErrors, notFound } from '@/lib/api';
import { requireUser } from '@/lib/session';
import { passwordChangeSchema } from '@/lib/validation/dashboard';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return withErrors(async () => {
    const user = await requireUser();
    if (user instanceof Response) return user;
    const input = await parseJSON(req, passwordChangeSchema);
    await connectDB();
    const u = await User.findById(user.id).select('+passwordHash');
    if (!u) return notFound('Account not found');
    const matches = await bcrypt.compare(input.currentPassword, u.passwordHash);
    if (!matches) return fail('Current password is incorrect', 401);
    u.passwordHash = await bcrypt.hash(input.newPassword, 12);
    await u.save();
    await logAudit({
      actorId: user.id as any,
      actorName: user.name,
      actorRole: user.role,
      action: 'account.password_changed',
      label: 'Password changed',
      subjectType: 'user',
      subjectId: u._id as any,
      subjectDescription: u.email,
    });
    return ok({ changed: true });
  }) as unknown as NextResponse;
}
