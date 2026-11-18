import { Types } from 'mongoose';
import { requireUser, type SessionUser } from './session';
import { forbidden } from './api';

/**
 * Require the session user to be an active org member. Returns a bound
 * context with `orgId` (ObjectId) and the session `user`, or an auth Response.
 */
export async function requireOrgMember(): Promise<{ user: SessionUser; orgId: Types.ObjectId } | Response> {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const orgRoles = new Set(['representative', 'org_admin']);
  if (!orgRoles.has(user.role)) return forbidden('Organization members only');
  if (!user.organizationId) return forbidden('No organization linked to your account');
  return { user, orgId: new Types.ObjectId(user.organizationId) };
}

export async function requireOrgAdmin(): Promise<{ user: SessionUser; orgId: Types.ObjectId } | Response> {
  const ctx = await requireOrgMember();
  if (ctx instanceof Response) return ctx;
  if (ctx.user.role !== 'org_admin') return forbidden('Organization admins only');
  return ctx;
}
