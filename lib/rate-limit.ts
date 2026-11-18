// Simple in-memory sliding-window rate limiter.
// Not for distributed deployments — swap for Redis there.

type Hit = { count: number; resetAt: number };

const BUCKETS = new Map<string, Hit>();
const MAX_KEYS = 10_000;

export function rateLimit({ key, limit, windowMs }: { key: string; limit: number; windowMs: number }) {
  const now = Date.now();
  const existing = BUCKETS.get(key);
  if (!existing || existing.resetAt <= now) {
    BUCKETS.set(key, { count: 1, resetAt: now + windowMs });
    // Opportunistic prune.
    if (BUCKETS.size > MAX_KEYS) {
      for (const [k, v] of BUCKETS) if (v.resetAt <= now) BUCKETS.delete(k);
    }
    return { ok: true, remaining: limit - 1, retryAfterMs: 0 };
  }
  existing.count += 1;
  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfterMs: existing.resetAt - now };
  }
  return { ok: true, remaining: limit - existing.count, retryAfterMs: 0 };
}

export function clearRateLimit(key: string) {
  BUCKETS.delete(key);
}
