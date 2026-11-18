'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1 } from '@/components/ui/Typography';
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
`;
const TCard = styled.div` background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; overflow: hidden; overflow-x: auto; `;
const T = styled.table`
  width: 100%; border-collapse: collapse; font-size: 13px;
  th { text-align: left; padding: 12px 16px; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; background: ${({ theme }) => theme.colors.bg}; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
  td { padding: 12px 16px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.ink}; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
`;
const From = styled.div`
  display: flex; align-items: center; gap: 10px;
  .av { width: 30px; height: 30px; border-radius: 999px; background: #0F766E; color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 11px; flex-shrink: 0; }
  .em { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; font-weight: 500; }
`;

const TABS = [
  { v: 'all', l: 'All' }, { v: 'unassigned', l: 'Unassigned' },
  { v: 'waiting', l: 'Awaiting reply' }, { v: 'flagged', l: 'Flagged' }, { v: 'resolved', l: 'Resolved' },
];

export default function AdminInquiriesPage() {
  const [tab, setTab] = useState('all');
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function reload() {
    const d = await adminApi.inquiries.list({ tab });
    setData(d);
  }
  useEffect(() => { reload(); }, [tab]);

  async function patch(id: string, payload: any) {
    setBusy(id);
    try { await adminApi.inquiries.patch(id, payload); await reload(); } finally { setBusy(null); }
  }

  return (
    <>
      <SessionTopbar fallbackName="Admin" fallbackInitial="A" fallbackRole="Super admin" searchPlaceholder="Search inquiries…" />
      <Crumbs>Admin › Inquiries</Crumbs>
      <PageTitle><H1>Inquiry management</H1></PageTitle>

      <Metrics>
        <MetricCard label="Total · 30d" value={data?.metrics?.total30 ?? '—'} />
        <MetricCard label="Unassigned" value={data?.metrics?.unassigned ?? '—'} deltaTone={data?.metrics?.unassigned ? 'error' : 'neutral'} />
        <MetricCard label="Awaiting reply · 24h+" value={data?.metrics?.waiting24 ?? '—'} deltaTone={data?.metrics?.waiting24 ? 'warning' : 'neutral'} />
        <MetricCard label="Avg reply time" value={data?.metrics?.avgReplyHours != null ? `${data.metrics.avgReplyHours}h` : '—'} />
      </Metrics>

      <Tabs>
        {TABS.map((t) => (<Tab key={t.v} $active={tab === t.v} onClick={() => setTab(t.v)}>{t.l}</Tab>))}
      </Tabs>

      <TCard>
        <T>
          <thead>
            <tr><th>From</th><th>Subject</th><th>Type</th><th>Scope</th><th>Organization</th><th>Status</th><th>Received</th></tr>
          </thead>
          <tbody>
            {!data && <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading…</td></tr>}
            {data?.items?.length === 0 && <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No inquiries.</td></tr>}
            {data?.items?.map((r: any) => (
              <tr key={r.id}>
                <td>
                  <From>
                    <div className="av">{r.initial}</div>
                    <div>
                      <div>{r.fromName}</div>
                      <div className="em">{r.fromEmail}</div>
                    </div>
                  </From>
                </td>
                <td>{r.subject}</td>
                <td style={{ textTransform: 'capitalize' }}>{r.type}</td>
                <td style={{ textTransform: 'capitalize' }}>{r.scope}</td>
                <td>{r.organization?.name || '—'}</td>
                <td>
                  <select disabled={busy === r.id} value={r.status} onChange={(e) => patch(r.id, { status: e.target.value })} style={{ padding: '4px 8px', fontSize: 12, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                    <option value="new">New</option>
                    <option value="waiting">Waiting</option>
                    <option value="resolved">Resolved</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </T>
      </TCard>
    </>
  );
}
