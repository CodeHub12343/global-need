import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Inquiry, User } from '@/lib/models';
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

    const inquiries = await Inquiry.find({ fromEmail: user.email.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const counts = {
      total: inquiries.length,
      awaiting: inquiries.filter((i) => i.status === 'new' || i.status === 'waiting').length,
      resolved: inquiries.filter((i) => i.status === 'resolved').length,
    };

    return ok({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        initial: user.name.charAt(0).toUpperCase(),
      },
      counts,
      inquiries: inquiries.map((i) => ({
        id: String(i._id),
        subject: i.subject,
        status: i.status,
        scope: i.scope,
        type: i.type,
        createdAt: i.createdAt,
        messagesCount: (i.messages || []).length,
      })),
    });
  }) as unknown as NextResponse;
}
