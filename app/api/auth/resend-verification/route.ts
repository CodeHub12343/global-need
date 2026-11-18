import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { ok, parseJSON, withErrors } from '@/lib/api';
import { resendVerificationSchema } from '@/lib/validation/auth';
import { generateCode, minutesFromNow } from '@/lib/tokens';
import { sendMail } from '@/lib/mail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return withErrors(async () => {
    const { email } = await parseJSON(req, resendVerificationSchema);
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() }).exec();
    // Do not reveal whether the account exists.
    if (user && !user.emailVerified) {
      const code = generateCode(6);
      user.verificationCode = code;
      user.verificationCodeExpires = minutesFromNow(15);
      await user.save();
      await sendMail({
        to: user.email,
        subject: 'Your Meeting Global Needs verification code',
        text: `Your new 6-digit verification code is: ${code}\nIt expires in 15 minutes.`,
      });
    }
    return ok({ sent: true });
  });
}
