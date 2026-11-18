import { connectDB } from '@/lib/db';
import { User, logAudit } from '@/lib/models';
import { ok, parseJSON, withErrors } from '@/lib/api';
import { forgotPasswordSchema } from '@/lib/validation/auth';
import { generateToken, hashToken, minutesFromNow } from '@/lib/tokens';
import { sendMail } from '@/lib/mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return withErrors(async () => {
    const { email } = await parseJSON(req, forgotPasswordSchema);
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() }).exec();
    // Always return a neutral response so callers cannot enumerate accounts.
    if (user) {
      const raw = generateToken(32);
      user.passwordResetToken = hashToken(raw);
      user.passwordResetExpires = minutesFromNow(60);
      await user.save();

      const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const link = `${base}/reset-password?token=${raw}`;
      await sendMail({
        to: user.email,
        subject: 'Reset your Meeting Global Needs password',
        text:
          `A password reset was requested for your account.\n\n` +
          `Reset link (valid 60 minutes):\n${link}\n\n` +
          `If you didn't request this, you can safely ignore this email.`,
      });
      await logAudit({
        actorId: user._id as any,
        actorName: user.name,
        actorRole: user.role,
        action: 'account.request_password_reset',
        label: 'Requested password reset',
        subjectType: 'user',
        subjectId: user._id as any,
        subjectDescription: user.email,
      });
    }
    return ok({ sent: true });
  });
}
