import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User, Organization, logAudit } from '@/lib/models';
import { conflict, created, parseJSON, withErrors } from '@/lib/api';
import { registerSchema } from '@/lib/validation/auth';
import { uniqueSlug } from '@/lib/slug';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return withErrors(async () => {
    const data = await parseJSON(req, registerSchema);
    await connectDB();

    const email = data.email.toLowerCase();
    const existing = await User.findOne({ email }).lean();
    if (existing) return conflict('An account with that email already exists');

    const passwordHash = await bcrypt.hash(data.password, 12);

    let organizationId: string | null = null;
    let role: 'representative' | 'org_admin' | 'supporter' = 'supporter';

    if (data.accountType === 'representative' && data.organizationName) {
      const slug = await uniqueSlug(data.organizationName, async (s) =>
        Boolean(await Organization.exists({ slug: s })),
      );
      const org = await Organization.create({
        name: data.organizationName,
        slug,
        country: data.country,
        status: 'pending',
        initial: data.organizationName.charAt(0).toUpperCase(),
      });
      organizationId = String(org._id);
      role = 'org_admin';
    } else if (data.accountType === 'representative') {
      role = 'representative';
    }

    const user = await User.create({
      name: `${data.firstName} ${data.lastName}`.trim(),
      email,
      passwordHash,
      role,
      status: 'active',
      country: data.country,
      organizationId: organizationId ?? undefined,
      emailVerified: true,
    });

    if (organizationId) {
      await Organization.updateOne(
        { _id: organizationId },
        { $set: { adminIds: [user._id] }, $addToSet: { memberIds: user._id } },
      );
    }

    await logAudit({
      actorId: user._id as any,
      actorName: user.name,
      actorRole: user.role,
      action: 'account.register',
      label: 'Registered account',
      subjectType: 'user',
      subjectId: user._id as any,
      subjectDescription: `${user.email} · ${user.role}`,
    });

    return created({ id: String(user._id), email: user.email });
  });
}
