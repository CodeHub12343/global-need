// Client-side helpers for the organization dashboard.

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { cache: 'no-store', ...init });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body?.ok) {
    const err: any = new Error(body?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.details = body?.details;
    throw err;
  }
  return body.data as T;
}

function qs(params: Record<string, any>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '' || v === false) continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const dashApi = {
  overview: () => json<any>('/api/dashboard/overview'),

  causes: {
    list: (params: Record<string, any> = {}) => json<any>(`/api/dashboard/causes${qs(params)}`),
    get: (id: string) => json<any>(`/api/dashboard/causes/${id}`),
    create: (payload: any) => json<any>('/api/dashboard/causes', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
    patch: (id: string, payload: any) => json<any>(`/api/dashboard/causes/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
    remove: (id: string) => json<any>(`/api/dashboard/causes/${id}`, { method: 'DELETE' }),
    submit: (id: string) => json<any>(`/api/dashboard/causes/${id}/submit`, { method: 'POST' }),
  },

  updates: {
    list: (params: Record<string, any> = {}) => json<any>(`/api/dashboard/updates${qs(params)}`),
    get: (id: string) => json<any>(`/api/dashboard/updates/${id}`),
    create: (payload: any) => json<any>('/api/dashboard/updates', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
    patch: (id: string, payload: any) => json<any>(`/api/dashboard/updates/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
    remove: (id: string) => json<any>(`/api/dashboard/updates/${id}`, { method: 'DELETE' }),
    submit: (id: string) => json<any>(`/api/dashboard/updates/${id}/submit`, { method: 'POST' }),
  },

  inquiries: {
    list: (params: Record<string, any> = {}) => json<any>(`/api/dashboard/inquiries${qs(params)}`),
    get: (id: string) => json<any>(`/api/dashboard/inquiries/${id}`),
    patch: (id: string, payload: any) => json<any>(`/api/dashboard/inquiries/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
    reply: (id: string, body: string) => json<any>(`/api/dashboard/inquiries/${id}/messages`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ body }) }),
  },

  organization: {
    get: () => json<any>('/api/dashboard/organization'),
    patch: (payload: any) => json<any>('/api/dashboard/organization', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
  },

  team: {
    list: () => json<any[]>('/api/dashboard/team'),
    invite: (payload: any) => json<any>('/api/dashboard/team', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
    patch: (id: string, payload: any) => json<any>(`/api/dashboard/team/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
    remove: (id: string) => json<any>(`/api/dashboard/team/${id}`, { method: 'DELETE' }),
  },

  documents: {
    list: (params: Record<string, any> = {}) => json<any[]>(`/api/dashboard/documents${qs(params)}`),
    create: (payload: any) => json<any>('/api/dashboard/documents', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
    remove: (id: string) => json<any>(`/api/dashboard/documents/${id}`, { method: 'DELETE' }),
  },

  settings: {
    get: () => json<any>('/api/dashboard/settings'),
    patch: (payload: any) => json<any>('/api/dashboard/settings', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }),
    changePassword: (currentPassword: string, newPassword: string) =>
      json<any>('/api/dashboard/settings/password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) }),
  },
};
