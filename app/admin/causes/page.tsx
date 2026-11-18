'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Eye, MoreVertical, Search, Star, X } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1 } from '@/components/ui/Typography';
import { StatusPill } from '@/components/ui/Pill';
import { adminApi } from '@/lib/admin-api';

const Tabs = styled.div`
  display: flex; gap: 4px; border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 22px; overflow-x: auto;
`;
const Tab = styled.button<{ $active?: boolean }>`
  padding: 10px 16px; font-size: 13px; font-weight: 600;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary700 : theme.colors.muted)};
  border: none; border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary700 : 'transparent')};
  background: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-family: inherit; white-space: nowrap;
  .tc { background: ${({ $active, theme }) => ($active ? theme.colors.primary100 : theme.colors.bgSoft)}; color: ${({ $active, theme }) => ($active ? theme.colors.primary800 : theme.colors.muted)}; padding: 1px 7px; border-radius: 999px; font-size: 11px; font-weight: 700; }
`;
const Controls = styled.div`
  background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 12px; padding: 14px 16px;
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 14px;
  .fs { position: relative; flex-grow: 1; min-width: 220px; }
  .fs input { width: 100%; padding: 8px 12px 8px 32px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; border-radius: 8px; font-size: 13px; font-family: inherit; background: #fff; }
  .fs svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.muted}; }
`;
const TCard = styled.div` background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; overflow: hidden; overflow-x: auto; `;
const T = styled.table`
  width: 100%; border-collapse: collapse; font-size: 13px;
  th { text-align: left; padding: 12px 16px; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; background: ${({ theme }) => theme.colors.bg}; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; white-space: nowrap; }
  td { padding: 14px 16px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.ink}; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #FAFBFC; }
`;
const Cc = styled.div`
  display: flex; gap: 12px; align-items: center; min-width: 260px;
  .im { width: 40px; height: 40px; border-radius: 8px; flex-shrink: 0; }
  .t { font-weight: 600; color: ${({ theme }) => theme.colors.ink}; line-height: 1.3; }
  .s { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; font-family: ui-monospace, monospace; }
`;
const TABS = [
  { v: 'all', l: 'All' }, { v: 'pending', l: 'Pending' }, { v: 'changes', l: 'Changes' },
  { v: 'approved', l: 'Approved' }, { v: 'rejected', l: 'Rejected' }, { v: 'suspended', l: 'Suspended' },
];

export default function AdminCausesPage() {
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function reload() {
    const d = await adminApi.causes.list({ status: tab, q, limit: 50 });
    setData(d);
  }
  useEffect(() => { reload(); }, [tab, q]);

  async function toggleFeature(id: string, current: boolean) {
    setBusy(id);
    try { await adminApi.causes.feature(id, !current); await reload(); } finally { setBusy(null); }
  }

  return (
    <>
      <SessionTopbar fallbackName="Admin" fallbackInitial="A" fallbackRole="Super admin" searchPlaceholder="Search causes…" />
      <Crumbs>Admin › Causes</Crumbs>
      <PageTitle><H1>Cause management</H1></PageTitle>

      <Tabs>
        {TABS.map((t) => (
          <Tab key={t.v} $active={tab === t.v} onClick={() => setTab(t.v)}>
            {t.l}<span className="tc">{t.v === 'all' ? (data?.total ?? 0) : (data?.countsByStatus?.[t.v] ?? 0)}</span>
          </Tab>
        ))}
      </Tabs>

      <Controls>
        <div className="fs">
          <Search size={14} />
          <input type="search" placeholder="Filter in list…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </Controls>

      <TCard>
        <T>
          <thead>
            <tr>
              <th>Cause</th><th>Category</th><th>Organization</th><th>Status</th><th>Submitted</th><th>Reviewer</th><th>Featured</th>
            </tr>
          </thead>
          <tbody>
            {!data && (<tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading…</td></tr>)}
            {data?.items?.length === 0 && (<tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No causes found.</td></tr>)}
            {data?.items?.map((r: any) => (
              <tr key={r.id}>
                <td>
                  <Cc>
                    <div className="im" style={{ background: r.gradient }} />
                    <div>
                      <div className="t">{r.title}</div>
                      <div className="s">{r.publicId || r.id.slice(-8)}</div>
                    </div>
                  </Cc>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{r.category?.replace('-', ' ')}</td>
                <td>{r.organization?.name || '—'}</td>
                <td><StatusPill status={r.status} /></td>
                <td>{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}</td>
                <td>{r.assignedReviewer?.name || <span style={{ color: '#94A3B8' }}>Unassigned</span>}</td>
                <td>
                  <button
                    onClick={() => toggleFeature(r.id, r.featured)}
                    disabled={busy === r.id}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    title={r.featured ? 'Unfeature' : 'Feature'}
                  >
                    {r.featured ? <Star size={14} color="#D97706" fill="#D97706" /> : <span style={{ color: '#94A3B8' }}>â˜†</span>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </T>
      </TCard>
    </>
  );
}
