import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Subscriber } from '@/lib/models';
import { logAudit } from '@/lib/models/AuditLog';
import { ok, fail, parseJSON, withErrors } from '@/lib/api';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const subscribeSchema = z.object({
  email: z.string().email().max(200),
  source: z.string().max(60).optional(),
});

export async function POST(req: Request) {
  return withErrors(async () => {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const input = await parseJSON(req, subscribeSchema);
    const email = input.email.toLowerCase().trim();

    const gate = rateLimit({ key: `subscribe:${ip}:${email}`, limit: 3, windowMs: 10 * 60_000 });
    if (!gate.ok) {
      return fail(
        `Too many requests. Try again in ${Math.ceil(gate.retryAfterMs / 60_000)} minute(s).`,
        429,
      );
    }

    await connectDB();

    const existing = await Subscriber.findOne({ email });
    let state: 'created' | 'reactivated' | 'already_subscribed';

    if (!existing) {
      await Subscriber.create({ email, source: input.source || 'landing', status: 'active' });
      state = 'created';
    } else if (existing.status === 'unsubscribed') {
      existing.status = 'active';
      existing.unsubscribedAt = undefined;
      await existing.save();
      state = 'reactivated';
    } else {
      state = 'already_subscribed';
    }

    if (state !== 'already_subscribed') {
      await logAudit({
        actorName: email,
        actorRole: 'public',
        action: 'subscriber.created',
        label: state === 'reactivated' ? 'Resubscribed to digest' : 'Subscribed to digest',
        subjectType: 'subscriber',
        subjectDescription: email,
        metadata: { source: input.source || 'landing' },
      }).catch(() => {});
    }

    return ok({ state, email });
  }) as unknown as NextResponse;
}
