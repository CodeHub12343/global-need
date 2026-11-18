import { connectDB } from '@/lib/db';
import { Organization, User } from '@/lib/models';
import { ok, unauthorized, withErrors } from '@/lib/api';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return withErrors(async () => {
    const session = await getSession();
    if (!session?.user?.id) return unauthorized();
    await connectDB();
    const user = await User.findById(session.user.id).lean();
    if (!user) return unauthorized();

    let organization: { id: string; name: string; status: string; initial?: string } | null = null;
    if (user.organizationId) {
      const org = await Organization.findById(user.organizationId).lean();
      if (org) {
        organization = {
          id: String(org._id),
          name: org.name,
          status: org.status,
          initial: org.initial ?? org.name.charAt(0).toUpperCase(),
        };
      }
    }

    return ok({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        initial: user.name.charAt(0).toUpperCase(),
      },
      organization,
    });
  });
}
