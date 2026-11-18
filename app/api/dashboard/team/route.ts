import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { Organization, User } from '@/lib/models';
import { ok, created, conflict, parseJSON, withErrors } from '@/lib/api';
import { requireOrgAdmin, requireOrgMember } from '@/lib/dashboard-auth';
import { inviteSchema } from '@/lib/validation/dashboard';
import { shapeTeamMember } from '@/lib/dashboard-shape';
import { sendMail } from '@/lib/mail';
import { generateToken, hashToken, minutesFromNow } from '@/lib/tokens';
import { logAudit } from '@/lib/models/AuditLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return withErrors(async () => {
    const ctx = await requireOrgMember();
    if (ctx instanceof Response) return ctx;
    await connectDB();
    const members = await User.find({ organizationId: ctx.orgId }).sort({ createdAt: 1 }).lean();
    return ok(members.map(shapeTeamMember));
  }) as unknown as NextResponse;
}

export async function POST(req: Request) {
  return withErrors(async () => {
    const ctx = await requireOrgAdmin();
    if (ctx instanceof Response) return ctx;
    const input = await parseJSON(req, inviteSchema);
    await connectDB();
    const email = input.email.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) return conflict('A user with this email already exists');

    // Random password; reset token sent to let them pick one.
    const tempPassword = generateToken(16);
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    const rawToken = generateToken(32);
    const u = await User.create({
      name: input.name,
      email,
      passwordHash,
      role: input.role,
      status: 'pending',
      emailVerified: false,
      organizationId: ctx.orgId,
      passwordResetToken: hashToken(rawToken),
      passwordResetExpires: minutesFromNow(60 * 24 * 3),
    });
    await Organization.updateOne(
      { _id: ctx.orgId },
      { $addToSet: input.role === 'org_admin' ? { adminIds: u._id } : { memberIds: u._id } },
    );
    await sendMail({
      to: email,
      subject: 'You were invited to join an organization on Meeting Global Needs',
      text: `${ctx.user.name} invited you to join their organization. Set your password: /reset-password?token=${rawToken}`,
    });
    await logAudit({
      actorId: ctx.user.id as any,
      actorName: ctx.user.name,
      actorRole: ctx.user.role,
      action: 'team.invited',
      label: 'Team member invited',
      subjectType: 'user',
      subjectId: u._id as any,
      subjectDescription: `${input.name} <${email}>`,
      metadata: { organizationId: String(ctx.orgId), role: input.role },
    });
    return created(shapeTeamMember(u.toObject()));
  }) as unknown as NextResponse;
}
