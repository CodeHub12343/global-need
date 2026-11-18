import { requireUser, type SessionUser } from './session';
import { forbidden } from './api';

export async function requireAdmin(): Promise<SessionUser | Response> {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.role !== 'super_admin') return forbidden('Super admins only');
  return user;
}
