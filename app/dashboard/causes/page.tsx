'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Plus, Eye, Edit2, Trash2, Search, Send } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1 } from '@/components/ui/Typography';
import { Button, LinkButton } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Pill';
import { CATEGORIES } from '@/lib/mock-data';
import { dashApi } from '@/lib/dashboard-api';
import type { CauseStatus } from '@/lib/mock-data';

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 18px;
  overflow-x: auto;
`;
const Tab = styled.button<{ $active?: boolean }>`
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary700 : theme.colors.muted)};
  border: none;
  border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary700 : 'transparent')};
  background: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  white-space: nowrap;
  .tc { background: ${({ $active, theme }) => ($active ? theme.colors.primary100 : theme.colors.bgSoft)}; color: ${({ $active, theme }) => ($active ? theme.colors.primary800 : theme.colors.muted)}; padding: 1px 7px; border-radius: 999px; font-size: 11px; font-weight: 700; }
`;
const Controls = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
  .fs { position: relative; flex-grow: 1; min-width: 220px; }
  .fs input { width: 100%; padding: 8px 12px 8px 32px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; border-radius: 8px; font-size: 13px; font-family: inherit; }
  .fs svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.muted}; }
  select { padding: 8px 12px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; border-radius: 8px; font-size: 13px; font-family: inherit; background: #fff; }
`;
const TableCard = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  overflow: hidden;
  overflow-x: auto;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  th { text-align: left; padding: 12px 16px; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; background: ${({ theme }) => theme.colors.bg}; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; white-space: nowrap; }
  td { padding: 14px 16px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.ink}; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #FAFBFC; }
`;
const CauseCell = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 260px;
  .im { width: 42px; height: 42px; border-radius: 9px; flex-shrink: 0; }
  .t { font-weight: 600; color: ${({ theme }) => theme.colors.ink}; line-height: 1.3; }
  .s { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
`;
const RowActions = styled.div`
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  button, a { width: 30px; height: 30px; border: 1px solid ${({ theme }) => theme.colors.border}; background: #fff; border-radius: 7px; display: grid; place-items: center; color: ${({ theme }) => theme.colors.muted}; cursor: pointer; text-decoration: none; }
  button:hover, a:hover { color: ${({ theme }) => theme.colors.primary}; border-color: ${({ theme }) => theme.colors.primary}; }
`;

const TABS: { key: CauseStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Drafts' },
  { key: 'pending', label: 'Pending' },
  { key: 'changes', label: 'Changes requested' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

function relativeTime(iso: string | null): string {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.max(0, Math.round(ms / 3600e3));
  if (h < 2) return 'just now';
  if (h < 48) return `${h}h ago`;
  const d = Math.round(ms / 86400e3);
  if (d < 14) return `${d}d ago`;
  return `${Math.round(d / 7)}w ago`;
}

export default function MyCausesPage() {
  const [active, setActive] = useState<CauseStatus | 'all'>('all');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('recent');
  const [state, setState] = useState<{ items: any[]; counts: Record<string, number>; loading: boolean; error?: string }>({ items: [], counts: {}, loading: true });

  async function reload() {
    setState((s) => ({ ...s, loading: true, error: undefined }));
    try {
      const data = await dashApi.causes.list({ status: active, q, category, sort });
      setState({ items: data.items, counts: data.counts, loading: false });
    } catch (err: any) {
      setState({ items: [], counts: {}, loading: false, error: err.message });
    }
  }

  useEffect(() => { reload(); }, [active, q, category, sort]);

  async function remove(id: string) {
    if (!confirm('Delete this draft? This cannot be undone.')) return;
    try { await dashApi.causes.remove(id); reload(); } catch (err: any) { alert(err.message); }
  }
  async function submit(id: string) {
    try { await dashApi.causes.submit(id); reload(); }
    catch (err: any) { alert(err.message + (err.details?.missing ? `\nMissing: ${err.details.missing.join(', ')}` : '')); }
  }

  const summary = useMemo(() => (state.loading ? 'Loading…' : `${state.items.length} shown`), [state]);

  return (
    <>
      <SessionTopbar searchPlaceholder="Search your causes…" fallbackName="Organization" fallbackInitial="O" fallbackRole="Organization" showOrgInsteadOfRole />
      <Crumbs>Dashboard › My causes</Crumbs>
      <PageTitle>
        <H1>My causes</H1>
        <div style={{ display: 'flex', gap: 10 }}>
          <LinkButton as={Link} href="/dashboard/causes/new" $variant="primary" $size="md">
            <Plus size={13} />Submit a new cause
          </LinkButton>
        </div>
      </PageTitle>

      <Tabs>
        {TABS.map((t) => (
          <Tab key={t.key} $active={active === t.key} onClick={() => setActive(t.key)}>
            {t.label}<span className="tc">{state.counts[t.key] ?? 0}</span>
          </Tab>
        ))}
      </Tabs>

      <Controls>
        <div className="fs">
          <Search size={14} />
          <input type="search" placeholder="Filter in list…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recent">Sort: most recent</option>
          <option value="oldest">Sort: oldest</option>
          <option value="title">Sort: title</option>
        </select>
      </Controls>

      <TableCard>
        <Table>
          <thead>
            <tr>
              <th style={{ width: 36 }}><input type="checkbox" /></th>
              <th>Cause</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Last update</th>
              <th>Views</th>
              <th>Inquiries</th>
              <th style={{ width: 140 }} />
            </tr>
          </thead>
          <tbody>
            {state.loading && state.items.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading…</td></tr>
            )}
            {!state.loading && state.items.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No causes yet.</td></tr>
            )}
            {state.items.map((r) => (
              <tr key={r.id}>
                <td><input type="checkbox" /></td>
                <td>
                  <CauseCell>
                    <div className="im" style={{ background: r.gradient }} />
                    <div>
                      <div className="t">{r.title}</div>
                      <div className="s">{r.publicId || 'Draft'} · {r.category}</div>
                    </div>
                  </CauseCell>
                </td>
                <td><StatusPill status={r.status as CauseStatus} /></td>
                <td>{relativeTime(r.submittedAt)}</td>
                <td>{relativeTime(r.lastUpdatedAt)}</td>
                <td>{r.views || '—'}</td>
                <td>{r.inquiriesCount || 0}</td>
                <td>
                  <RowActions>
                    {r.status === 'approved' && r.slug && (
                      <Link href={`/causes/${r.slug}`} title="View public page"><Eye size={14} /></Link>
                    )}
                    <Link href={`/dashboard/causes/new?id=${r.id}`} title="Edit"><Edit2 size={14} /></Link>
                    {(r.status === 'draft' || r.status === 'changes') && (
                      <button title="Submit for review" onClick={() => submit(r.id)}><Send size={14} /></button>
                    )}
                    {r.status === 'draft' && (
                      <button title="Delete draft" onClick={() => remove(r.id)}><Trash2 size={14} /></button>
                    )}
                  </RowActions>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableCard>
    </>
  );
}
