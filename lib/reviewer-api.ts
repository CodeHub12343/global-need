// Client-side helpers for the reviewer workspace.

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

export const reviewerApi = {
  overview: () => json<any>('/api/reviewer/overview'),
  queue: (params: Record<string, any> = {}) => json<any>(`/api/reviewer/queue${qs(params)}`),
  reviewers: () => json<any[]>('/api/reviewer/reviewers'),
  history: (params: Record<string, any> = {}) => json<any[]>(`/api/reviewer/history${qs(params)}`),
  submission: {
    get: (id: string) => json<any>(`/api/reviewer/submissions/${id}`),
    decide: (id: string, payload: any) => json<any>(`/api/reviewer/submissions/${id}/decision`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
    }),
    assign: (id: string, reviewerId: string | null | undefined) => json<any>(`/api/reviewer/submissions/${id}/assign`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reviewerId }),
    }),
  },
  update: {
    get: (id: string) => json<any>(`/api/reviewer/updates/${id}`),
    decide: (id: string, payload: any) => json<any>(`/api/reviewer/updates/${id}/decision`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
    }),
    assign: (id: string, reviewerId: string | null | undefined) => json<any>(`/api/reviewer/updates/${id}/assign`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reviewerId }),
    }),
  },
  organizations: {
    list: (status = 'pending') => json<any[]>(`/api/reviewer/organizations${qs({ status })}`),
    decide: (id: string, payload: any) => json<any>(`/api/reviewer/organizations/${id}/decision`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
    }),
  },
};
