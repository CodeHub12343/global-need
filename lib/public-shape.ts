import type { HydratedDocument } from 'mongoose';
import type { CauseDoc } from './models/Cause';
import type { OrganizationDoc } from './models/Organization';
import type { ProgressUpdateDoc } from './models/ProgressUpdate';

type OrgLike = HydratedDocument<OrganizationDoc> | (OrganizationDoc & { _id: unknown });

const DEFAULT_GRADIENT = 'linear-gradient(135deg,#0F766E,#115E59)';

export function initialOf(name: string): string {
  const first = name.trim().charAt(0).toUpperCase();
  return first || '?';
}

export function locationOf(country?: string | null, city?: string | null): string {
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return '';
}

export function shapeOrganizationPublic(o: OrgLike) {
  const name = (o as any).name as string;
  return {
    id: String((o as any)._id),
    slug: (o as any).slug as string,
    name,
    initial: (o as any).initial || initialOf(name),
    category: (o as any).category || 'other',
    country: (o as any).country || '',
    city: (o as any).city || '',
    location: locationOf((o as any).country, (o as any).city),
    description: (o as any).shortDescription || (o as any).description || '',
    longDescription: (o as any).description || '',
    website: (o as any).website || '',
    publicEmail: (o as any).publicEmail || '',
    publicPhone: (o as any).publicPhone || '',
    operatingSince: (o as any).operatingSince || '',
    verified: (o as any).status === 'verified',
    verifiedAt: (o as any).verifiedAt || null,
    gradient: (o as any).gradient || DEFAULT_GRADIENT,
    checksPassed: (o as any).checksPassed ?? 0,
    checksTotal: (o as any).checksTotal ?? 3,
    createdAt: (o as any).createdAt || null,
  };
}

type CauseLike = HydratedDocument<CauseDoc> | (CauseDoc & { _id: unknown; organizationId: any });

export function shapeCausePublic(c: CauseLike, orgDoc?: OrgLike | null) {
  const org = orgDoc ?? (typeof (c as any).organizationId === 'object' && (c as any).organizationId !== null && (c as any).organizationId.slug
    ? (c as any).organizationId
    : null);
  return {
    id: String((c as any)._id),
    slug: (c as any).slug as string,
    publicId: (c as any).publicId || '',
    title: (c as any).title as string,
    category: (c as any).category as string,
    shortDescription: (c as any).shortDescription || '',
    story: (c as any).story || '',
    need: (c as any).need || '',
    whoItSupports: (c as any).whoItSupports || '',
    intendedUse: (c as any).intendedUse || '',
    whyNow: (c as any).whyNow || '',
    primaryAssistance: (c as any).primaryAssistance || '',
    timeline: (c as any).timeline || '',
    country: (c as any).country || '',
    city: (c as any).city || '',
    location: locationOf((c as any).country, (c as any).city) || (c as any).location || '',
    gradient: (c as any).gradient || DEFAULT_GRADIENT,
    status: (c as any).status,
    featured: !!(c as any).featured,
    publishedAt: (c as any).publishedAt || null,
    lastUpdatedAt: (c as any).lastUpdatedAt || (c as any).updatedAt || null,
    views: (c as any).views || 0,
    inquiriesCount: (c as any).inquiriesCount || 0,
    organization: org ? shapeOrganizationPublic(org) : null,
  };
}

type UpdateLike =
  | HydratedDocument<ProgressUpdateDoc>
  | (ProgressUpdateDoc & { _id: unknown; causeId: any; organizationId: any });

export function shapeUpdatePublic(
  u: UpdateLike,
  causeDoc?: CauseLike | null,
  orgDoc?: OrgLike | null,
) {
  const cause = causeDoc ?? (typeof (u as any).causeId === 'object' && (u as any).causeId !== null && (u as any).causeId.slug
    ? (u as any).causeId
    : null);
  const org = orgDoc ?? (typeof (u as any).organizationId === 'object' && (u as any).organizationId !== null && (u as any).organizationId.slug
    ? (u as any).organizationId
    : null);
  return {
    id: String((u as any)._id),
    title: (u as any).title as string,
    body: (u as any).body || '',
    status: (u as any).status,
    approvedAt: (u as any).approvedAt || null,
    createdAt: (u as any).createdAt || null,
    cause: cause ? { slug: cause.slug, title: cause.title, category: cause.category, gradient: cause.gradient } : null,
    organization: org ? shapeOrganizationPublic(org) : null,
  };
}
