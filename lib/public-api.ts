// Client-side helpers for the public website.
// Shapes mirror lib/public-shape.ts on the server.

export type PublicOrganization = {
  id: string;
  slug: string;
  name: string;
  initial: string;
  category: string;
  country: string;
  city: string;
  location: string;
  description: string;
  longDescription: string;
  website: string;
  publicEmail: string;
  publicPhone: string;
  operatingSince: string;
  verified: boolean;
  verifiedAt: string | null;
  gradient: string;
  checksPassed: number;
  checksTotal: number;
  createdAt: string | null;
  publishedCauses?: number;
};

export type PublicCause = {
  id: string;
  slug: string;
  publicId: string;
  title: string;
  category: string;
  shortDescription: string;
  story: string;
  need: string;
  whoItSupports: string;
  intendedUse: string;
  whyNow: string;
  primaryAssistance: string;
  timeline: string;
  country: string;
  city: string;
  location: string;
  gradient: string;
  status: string;
  featured: boolean;
  publishedAt: string | null;
  lastUpdatedAt: string | null;
  views: number;
  inquiriesCount: number;
  organization: PublicOrganization | null;
};

export type PublicUpdate = {
  id: string;
  title: string;
  body: string;
  status: string;
  approvedAt: string | null;
  createdAt: string | null;
  cause: { slug: string; title: string; category: string; gradient: string } | null;
  organization: PublicOrganization | null;
};

export type PublicCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  causeCount: number;
};

export type Pagination<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body?.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body.data as T;
}

export const publicApi = {
  categories: () => get<PublicCategory[]>('/api/categories'),
  stats: () =>
    get<{
      publishedCauses: number;
      verifiedOrgs: number;
      approvedUpdates: number;
      categories: number;
      verificationCheckpoints: number;
      reviewedBeforePublishingPct: number;
    }>('/api/stats'),
  featuredCauses: (limit = 6) => get<PublicCause[]>(`/api/causes/featured?limit=${limit}`),
  listCauses: (params: Record<string, string | number | boolean | undefined> = {}) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === '' || v === false) continue;
      qs.set(k, String(v));
    }
    return get<Pagination<PublicCause>>(`/api/causes${qs.toString() ? `?${qs}` : ''}`);
  },
  cause: (slug: string) =>
    get<{ cause: PublicCause; updates: PublicUpdate[] }>(`/api/causes/${encodeURIComponent(slug)}`),
  listOrganizations: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === '') continue;
      qs.set(k, String(v));
    }
    return get<Pagination<PublicOrganization>>(`/api/organizations${qs.toString() ? `?${qs}` : ''}`);
  },
  organization: (slug: string) =>
    get<{ organization: PublicOrganization; causes: PublicCause[]; updates: PublicUpdate[] }>(
      `/api/organizations/${encodeURIComponent(slug)}`,
    ),
  listUpdates: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === '') continue;
      qs.set(k, String(v));
    }
    return get<Pagination<PublicUpdate>>(`/api/updates${qs.toString() ? `?${qs}` : ''}`);
  },
  submitInquiry: async (input: {
    name: string;
    email: string;
    phone?: string;
    type: string;
    subject?: string;
    message: string;
    scope: 'general' | 'cause' | 'organization';
    causeSlug?: string;
    organizationSlug?: string;
  }): Promise<{ id: string; subject: string; status: string }> => {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.ok) {
      throw new Error(body?.error || `Request failed (${res.status})`);
    }
    return body.data;
  },
};
