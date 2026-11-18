// Guarded endpoint only used by tests to clear sign-in rate limits.
// Admin-only.
import { NextResponse } from 'next/server';
import { ok, withErrors, parseJSON } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { clearRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    const { email } = await parseJSON(req, z.object({ email: z.string().email() }));
    clearRateLimit(`signin:${email.toLowerCase()}`);
    return ok({ cleared: true });
  }) as unknown as NextResponse;
}
