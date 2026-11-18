import { requireUser, type SessionUser, isReviewer } from './session';
import { forbidden } from './api';

export async function requireReviewer(): Promise<SessionUser | Response> {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (!isReviewer(user.role)) return forbidden('Reviewers only');
  return user;
}

export async function requireSeniorReviewer(): Promise<SessionUser | Response> {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.role !== 'senior_reviewer' && user.role !== 'super_admin') return forbidden('Senior reviewers only');
  return user;
}
