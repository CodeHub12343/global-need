import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User, logAudit } from '@/lib/models';
import { fail, ok, parseJSON, withErrors } from '@/lib/api';
import { resetPasswordSchema } from '@/lib/validation/auth';
import { hashToken } from '@/lib/tokens';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return withErrors(async () => {
    const { token, password } = await parseJSON(req, resetPasswordSchema);
    await connectDB();
    const hashed = hashToken(token);
    const user = await User.findOne({ passwordResetToken: hashed })
      .select('+passwordResetToken +passwordResetExpires +passwordHash')
      .exec();
    if (!user) return fail('This reset link is invalid or has already been used', 400);
    if (!user.passwordResetExpires || new Date(user.passwordResetExpires).getTime() < Date.now()) {
      return fail('This reset link has expired. Please request a new one.', 400);
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined as any;
    user.passwordResetExpires = undefined as any;
    await user.save();

    await logAudit({
      actorId: user._id as any,
      actorName: user.name,
      actorRole: user.role,
      action: 'account.reset_password',
      label: 'Reset password',
      subjectType: 'user',
      subjectId: user._id as any,
      subjectDescription: user.email,
    });

    return ok({ reset: true });
  });
}
