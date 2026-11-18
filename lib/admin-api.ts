// Client-side helpers for the super admin center.

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { cache: 'no-store', ...init });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body?.ok) {
    const err: any = new Error(body?.error || `Request failed (${res.status})`);
    err.status = res.status; err.details = body?.details;
    throw err;
  }
  return body.data as T;
}

function qs(p: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    if (v === undefined || v === null || v === '' || v === false) continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

function jsonBody(payload: any, method = 'POST'): RequestInit {
  return { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) };
}

export const adminApi = {
  overview: (range = '30d') => json<any>(`/api/admin/overview${qs({ range })}`),
  reports: (range = '90d') => json<any>(`/api/admin/reports${qs({ range })}`),

  causes: {
    list: (params: Record<string, any> = {}) => json<any>(`/api/admin/causes${qs(params)}`),
    patch: (id: string, payload: any) => json<any>(`/api/admin/causes/${id}`, jsonBody(payload, 'PATCH')),
    remove: (id: string) => json<any>(`/api/admin/causes/${id}`, { method: 'DELETE' }),
    feature: (id: string, featured: boolean) => json<any>(`/api/admin/causes/${id}/feature`, jsonBody({ featured })),
  },

  submissions: {
    list: (params: Record<string, any> = {}) => json<any>(`/api/admin/submissions${qs(params)}`),
    bulkAssign: (payload: any) => json<any>('/api/admin/submissions/bulk-assign', jsonBody(payload)),
  },

  organizations: {
    list: (params: Record<string, any> = {}) => json<any>(`/api/admin/organizations${qs(params)}`),
    get: (id: string) => json<any>(`/api/admin/organizations/${id}`),
    patch: (id: string, payload: any) => json<any>(`/api/admin/organizations/${id}`, jsonBody(payload, 'PATCH')),
  },

  verification: {
    queue: () => json<any>('/api/admin/verification'),
    get: (id: string) => json<any>(`/api/admin/verification/${id}`),
    decide: (id: string, payload: any) => json<any>(`/api/admin/verification/${id}/decision`, jsonBody(payload)),
  },

  updates: {
    list: (params: Record<string, any> = {}) => json<any>(`/api/admin/updates${qs(params)}`),
  },

  users: {
    list: (params: Record<string, any> = {}) => json<any>(`/api/admin/users${qs(params)}`),
    patch: (id: string, payload: any) => json<any>(`/api/admin/users/${id}`, jsonBody(payload, 'PATCH')),
    invite: (payload: any) => json<any>('/api/admin/users/invite', jsonBody(payload)),
  },

  reviewers: {
    list: () => json<any>('/api/admin/reviewers'),
  },

  inquiries: {
    list: (params: Record<string, any> = {}) => json<any>(`/api/admin/inquiries${qs(params)}`),
    patch: (id: string, payload: any) => json<any>(`/api/admin/inquiries/${id}`, jsonBody(payload, 'PATCH')),
  },

  categories: {
    list: () => json<any[]>('/api/admin/categories'),
    create: (payload: any) => json<any>('/api/admin/categories', jsonBody(payload)),
    patch: (id: string, payload: any) => json<any>(`/api/admin/categories/${id}`, jsonBody(payload, 'PATCH')),
    remove: (id: string) => json<any>(`/api/admin/categories/${id}`, { method: 'DELETE' }),
    reorder: (order: string[]) => json<any>('/api/admin/categories/reorder', jsonBody({ order })),
  },

  auditLogs: {
    list: (params: Record<string, any> = {}) => json<any>(`/api/admin/audit-logs${qs(params)}`),
  },

  settings: {
    get: () => json<any>('/api/admin/settings'),
    patch: (payload: any) => json<any>('/api/admin/settings', jsonBody(payload, 'PATCH')),
  },
};
