import { connectDB } from '@/lib/db';
import { User, logAudit } from '@/lib/models';
import { fail, ok, parseJSON, withErrors } from '@/lib/api';
import { verifyEmailSchema } from '@/lib/validation/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return withErrors(async () => {
    const { email, code } = await parseJSON(req, verifyEmailSchema);
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+verificationCode +verificationCodeExpires')
      .exec();
    if (!user) return fail('Invalid code', 400);
    if (user.emailVerified) return ok({ alreadyVerified: true });

    if (!user.verificationCode || user.verificationCode !== code) {
      return fail('Invalid code', 400);
    }
    if (!user.verificationCodeExpires || new Date(user.verificationCodeExpires).getTime() < Date.now()) {
      return fail('This code has expired. Please request a new one.', 400);
    }

    user.emailVerified = true;
    user.status = user.status === 'suspended' ? 'suspended' : 'active';
    user.verificationCode = undefined as any;
    user.verificationCodeExpires = undefined as any;
    await user.save();

    await logAudit({
      actorId: user._id as any,
      actorName: user.name,
      actorRole: user.role,
      action: 'account.verify_email',
      label: 'Verified email address',
      subjectType: 'user',
      subjectId: user._id as any,
      subjectDescription: user.email,
    });

    return ok({ verified: true });
  });
}
