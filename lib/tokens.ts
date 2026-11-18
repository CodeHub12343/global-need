import crypto from 'crypto';

export function generateCode(length = 6): string {
  let out = '';
  for (let i = 0; i < length; i++) out += Math.floor(Math.random() * 10).toString();
  return out;
}

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function minutesFromNow(mins: number): Date {
  return new Date(Date.now() + mins * 60 * 1000);
}

export function isFuture(date?: Date | null): boolean {
  if (!date) return false;
  return new Date(date).getTime() > Date.now();
}
