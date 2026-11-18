import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import type { UserRole } from './models/types';
import { unauthorized, forbidden } from './api';

export async function getSession() {
  return getServerSession(authOptions);
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
  emailVerified: boolean;
  status: string;
};

export async function requireUser(): Promise<SessionUser | Response> {
  const session = await getSession();
  if (!session?.user?.id) return unauthorized('Sign in required');
  return session.user as SessionUser;
}

const ROLE_RANK: Record<UserRole, number> = {
  supporter: 1,
  representative: 2,
  org_admin: 3,
  reviewer: 4,
  senior_reviewer: 5,
  super_admin: 6,
};

export async function requireRole(
  ...allowed: UserRole[]
): Promise<SessionUser | Response> {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (!allowed.includes(user.role)) return forbidden('You do not have access to this resource');
  return user;
}

export async function requireAtLeast(role: UserRole): Promise<SessionUser | Response> {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (ROLE_RANK[user.role] < ROLE_RANK[role]) return forbidden('Insufficient role');
  return user;
}

export function isReviewer(role: UserRole) {
  return role === 'reviewer' || role === 'senior_reviewer' || role === 'super_admin';
}
export function isAdmin(role: UserRole) {
  return role === 'super_admin';
}
