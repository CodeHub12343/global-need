'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Search } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Pill } from '@/components/ui/Pill';
import { adminApi } from '@/lib/admin-api';

const Tabs = styled.div`
  display: flex; gap: 4px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; margin-bottom: 18px; overflow-x: auto;
`;
const Tab = styled.button<{ $active?: boolean }>`
  padding: 10px 14px; font-size: 13px; font-weight: 600;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary700 : theme.colors.muted)};
  border: none; border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary700 : 'transparent')};
  background: none; cursor: pointer; font-family: inherit;
  .tc { background: ${({ $active, theme }) => ($active ? theme.colors.primary100 : theme.colors.bgSoft)}; color: ${({ $active, theme }) => ($active ? theme.colors.primary800 : theme.colors.muted)}; padding: 1px 7px; border-radius: 999px; font-size: 11px; font-weight: 700; margin-left: 6px; }
`;
const Controls = styled.div`
  background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 12px; padding: 12px 14px;
  display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap;
  .fs { position: relative; flex-grow: 1; min-width: 220px; }
  .fs input { width: 100%; padding: 8px 12px 8px 32px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; border-radius: 8px; font-size: 13px; font-family: inherit; }
  .fs svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.muted}; }
`;
const TCard = styled.div` background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; overflow: hidden; overflow-x: auto; `;
const T = styled.table`
  width: 100%; border-collapse: collapse; font-size: 13px;
  th { text-align: left; padding: 12px 16px; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; background: ${({ theme }) => theme.colors.bg}; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
  td { padding: 14px 16px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.ink}; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
`;
const Oc = styled.div`
  display: flex; gap: 12px; align-items: center;
  .lg { width: 40px; height: 40px; border-radius: 9px; color: #fff; display: grid; place-items: center; font-weight: 700; font-family: ${({ theme }) => theme.fonts.serif}; flex-shrink: 0; }
  .n { font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
  .s { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
`;

const TABS = [
  { v: 'all', l: 'All' }, { v: 'pending', l: 'Pending' }, { v: 'verified', l: 'Verified' },
  { v: 'suspended', l: 'Suspended' }, { v: 'rejected', l: 'Rejected' },
];

export default function AdminOrgsPage() {
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [data, setData] = useState<any>(null);

  useEffect(() => { adminApi.organizations.list({ status: tab, q, limit: 50 }).then(setData).catch(() => {}); }, [tab, q]);

  return (
    <>
      <SessionTopbar fallbackName="Admin" fallbackInitial="A" fallbackRole="Super admin" searchPlaceholder="Search organizations…" />
      <Crumbs>Admin › Organizations</Crumbs>
      <PageTitle>
        <div>
          <H1>Organization management</H1>
          <Muted>Every organization on the platform.</Muted>
        </div>
      </PageTitle>

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
            <tr><th>Organization</th><th>Category</th><th>Location</th><th>Status</th><th>Causes</th><th>Contact</th></tr>
          </thead>
          <tbody>
            {!data && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading…</td></tr>}
            {data?.items?.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No organizations.</td></tr>}
            {data?.items?.map((o: any) => (
              <tr key={o.id}>
                <td>
                  <Oc>
                    <div className="lg" style={{ background: o.gradient }}>{o.initial}</div>
                    <div>
                      <div className="n">{o.name}</div>
                      <div className="s">{o.shortDescription || '—'}</div>
                    </div>
                  </Oc>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{o.category?.replace('-', ' ') || '—'}</td>
                <td>{[o.city, o.country].filter(Boolean).join(', ') || '—'}</td>
                <td>
                  <Pill $tone={o.status === 'verified' ? 'success' : o.status === 'pending' ? 'warning' : o.status === 'suspended' ? 'error' : 'neutral'}>
                    {o.status}
                  </Pill>
                </td>
                <td>{o.causesCount}</td>
                <td style={{ fontSize: 12, color: '#64748B' }}>{o.publicEmail || '—'}</td>
              </tr>
            ))}
          </tbody>
        </T>
      </TCard>
    </>
  );
}
