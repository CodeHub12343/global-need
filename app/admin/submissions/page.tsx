'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Clock } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Pill } from '@/components/ui/Pill';
import { MetricCard } from '@/components/ui/MetricCard';
import { adminApi } from '@/lib/admin-api';

const Metrics = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 22px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
`;
const Tabs = styled.div`
  display: flex; gap: 4px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; margin-bottom: 16px; overflow-x: auto;
`;
const Tab = styled.button<{ $active?: boolean }>`
  padding: 10px 14px; font-size: 13px; font-weight: 600;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary700 : theme.colors.muted)};
  border: none; border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary700 : 'transparent')};
  background: none; cursor: pointer; font-family: inherit; white-space: nowrap;
  .tc { background: ${({ $active, theme }) => ($active ? theme.colors.primary100 : theme.colors.bgSoft)}; color: ${({ $active, theme }) => ($active ? theme.colors.primary800 : theme.colors.muted)}; padding: 1px 7px; border-radius: 999px; font-size: 11px; font-weight: 700; margin-left: 6px; }
`;
const TCard = styled.div` background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; overflow: hidden; overflow-x: auto; `;
const T = styled.table`
  width: 100%; border-collapse: collapse; font-size: 13px;
  th { text-align: left; padding: 12px 16px; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; background: ${({ theme }) => theme.colors.bg}; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; white-space: nowrap; }
  td { padding: 14px 16px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.ink}; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #FAFBFC; cursor: pointer; }
`;
const Cc = styled.div`
  display: flex; gap: 12px; align-items: center; min-width: 240px;
  .im { width: 36px; height: 36px; border-radius: 7px; flex-shrink: 0; }
  .t { font-weight: 600; color: ${({ theme }) => theme.colors.ink}; line-height: 1.3; }
  .s { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
`;
const Age = styled.span<{ $tone?: 'hot' | 'warn' | '' }>`
  display: inline-flex; align-items: center; gap: 4px; font-weight: 600;
  color: ${({ $tone, theme }) => ($tone === 'hot' ? theme.colors.error : $tone === 'warn' ? theme.colors.warning : theme.colors.ink)};
`;

const TABS = [
  { v: 'all', l: 'All open' }, { v: 'unassigned', l: 'Unassigned' },
  { v: 'overdue', l: 'Overdue' }, { v: 'changes', l: 'Changes outstanding' },
];

export default function AdminSubmissionsPage() {
  const [tab, setTab] = useState('all');
  const [data, setData] = useState<any>(null);

  useEffect(() => { adminApi.submissions.list({ tab }).then(setData).catch(() => {}); }, [tab]);

  function hrefFor(r: any) {
    return r.kind === 'cause' ? `/reviewer/submissions/${r.id}` : `/reviewer/updates`;
  }

  return (
    <>
      <SessionTopbar fallbackName="Admin" fallbackInitial="A" fallbackRole="Super admin" searchPlaceholder="Search submissions…" />
      <Crumbs>Admin › Submission queue</Crumbs>
      <PageTitle>
        <div>
          <H1>Submission queue</H1>
          <Muted>All open submissions across reviewers, sorted by age.</Muted>
        </div>
      </PageTitle>

      <Metrics>
        <MetricCard label="Open total" value={data?.metrics?.open ?? '—'} />
        <MetricCard label="Unassigned" value={data?.metrics?.unassigned ?? '—'} deltaTone={data?.metrics?.unassigned ? 'error' : 'neutral'} />
        <MetricCard label="Overdue · 48h+" value={data?.metrics?.overdue ?? '—'} deltaTone={data?.metrics?.overdue ? 'warning' : 'neutral'} />
        <MetricCard label="Changes outstanding" value={data?.metrics?.changes ?? '—'} />
      </Metrics>

      <Tabs>
        {TABS.map((t) => (
          <Tab key={t.v} $active={tab === t.v} onClick={() => setTab(t.v)}>
            {t.l}<span className="tc">{data && t.v === 'all' ? data.metrics.open : data ? (t.v === 'unassigned' ? data.metrics.unassigned : t.v === 'overdue' ? data.metrics.overdue : data.metrics.changes) : 0}</span>
          </Tab>
        ))}
      </Tabs>

      <TCard>
        <T>
          <thead>
            <tr><th>Submission</th><th>Organization</th><th>Type</th><th>Age</th><th>Reviewer</th><th>Status</th></tr>
          </thead>
          <tbody>
            {!data && (<tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading…</td></tr>)}
            {data?.items?.length === 0 && (<tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Nothing in queue.</td></tr>)}
            {data?.items?.map((r: any) => (
              <tr key={`${r.kind}:${r.id}`} onClick={() => (window.location.href = hrefFor(r))}>
                <td>
                  <Cc>
                    <div className="im" style={{ background: r.gradient || '#0F766E' }} />
                    <div>
                      <div className="t"><Link href={hrefFor(r)} onClick={(e) => e.stopPropagation()} style={{ color: 'inherit', textDecoration: 'none' }}>{r.title}</Link></div>
                      <div className="s">{r.publicId || '—'}</div>
                    </div>
                  </Cc>
                </td>
                <td>{r.organization?.name || '—'}</td>
                <td style={{ textTransform: 'capitalize' }}>{r.kind}</td>
                <td><Age $tone={r.ageTone}><Clock size={11} />{r.ageHours != null ? `${r.ageHours}h` : '—'}</Age></td>
                <td>{r.assignedReviewer?.name || <span style={{ color: '#B91C1C', fontWeight: 600 }}>Unassigned</span>}</td>
                <td><Pill $tone={r.status === 'changes' ? 'info' : 'warning'}>{r.status === 'changes' ? 'Changes' : 'Pending'}</Pill></td>
              </tr>
            ))}
          </tbody>
        </T>
      </TCard>
    </>
  );
}
