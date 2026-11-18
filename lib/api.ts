import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function created<T>(data: T) {
  return NextResponse.json({ ok: true, data }, { status: 201 });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: message, details }, { status });
}

export function unauthorized(message = 'Unauthorized') {
  return fail(message, 401);
}

export function forbidden(message = 'Forbidden') {
  return fail(message, 403);
}

export function notFound(message = 'Not found') {
  return fail(message, 404);
}

export function conflict(message: string) {
  return fail(message, 409);
}

export function serverError(err: unknown) {
  // eslint-disable-next-line no-console
  console.error('[api error]', err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  return fail(message, 500);
}

export async function parseJSON<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  const body = await req.json().catch(() => ({}));
  return schema.parse(body);
}

export function fromZod(err: unknown) {
  if (err instanceof ZodError) {
    return fail('Validation failed', 422, err.flatten());
  }
  return null;
}

export async function withErrors(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (err) {
    const zod = fromZod(err);
    if (zod) return zod;
    return serverError(err);
  }
}
