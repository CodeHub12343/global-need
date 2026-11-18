'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ArrowUp } from 'lucide-react';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { H1, Muted } from '@/components/ui/Typography';
import { MetricCard } from '@/components/ui/MetricCard';
import { Panel, PanelHeading, PanelSubtitle } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { adminApi } from '@/lib/admin-api';

const RANGES = [
  { v: '24h', l: '24h' },
  { v: '7d', l: '7d' },
  { v: '30d', l: '30d' },
  { v: '90d', l: '90d' },
  { v: 'year', l: 'Year' },
];

const Range = styled.div`
  display: flex;
  gap: 6px;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 4px;
  button {
    padding: 6px 10px; border-radius: 7px; border: none; background: none;
    font-size: 12px; font-weight: 600; color: ${({ theme }) => theme.colors.muted};
    cursor: pointer; font-family: inherit;
    &.active { background: ${({ theme }) => theme.colors.primary50}; color: ${({ theme }) => theme.colors.primary800}; }
  }
`;
const Metrics = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
`;
const Grid = styled.div`
  display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Chart = styled.div` height: 240px; margin-top: 14px; svg { width: 100%; height: 100%; } `;
const Legend = styled.div`
  display: flex; gap: 16px; font-size: 12px; color: ${({ theme }) => theme.colors.muted};
  .sw { width: 9px; height: 9px; border-radius: 2px; display: inline-block; margin-right: 5px; vertical-align: middle; }
`;
const QRow = styled.div`
  display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; align-items: center;
  &:last-child { border-bottom: none; }
  .ic { width: 36px; height: 36px; border-radius: 9px; color: #fff; display: grid; place-items: center; flex-shrink: 0; font-weight: 700; font-size: 13px; font-family: ${({ theme }) => theme.fonts.serif}; }
  .t { font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
  .m { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
  .r { margin-left: auto; text-align: right; font-size: 11px; color: ${({ theme }) => theme.colors.muted2}; }
`;

function trendPath(values: number[], h = 220, w = 700) {
  if (!values.length) return '';
  const max = Math.max(1, ...values);
  const stepX = w / Math.max(1, values.length - 1);
  return values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${Math.round(i * stepX)} ${Math.round(h - (v / max) * (h - 20))}`).join(' ');
}

export default function AdminOverviewPage() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<any>(null);

  useEffect(() => { adminApi.overview(range).then(setData).catch(() => {}); }, [range]);

  const m = data?.metrics;
  const subs = data?.trends?.submissions || [];
  const apps = data?.trends?.approvals || [];
  const subPath = trendPath(subs);
  const appPath = trendPath(apps);

  return (
    <>
      <SessionTopbar searchPlaceholder="Search causes, organizations, users, inquiries…" fallbackName="Admin" fallbackInitial="A" fallbackRole="Super admin" />
      <Crumbs>Admin › Overview</Crumbs>
      <PageTitle>
        <div>
          <H1>Platform overview</H1>
          <Muted>A snapshot of submissions, organizations and reviewer activity.</Muted>
        </div>
        <Range>
          {RANGES.map((r) => (
            <button key={r.v} className={range === r.v ? 'active' : ''} onClick={() => setRange(r.v)}>{r.l}</button>
          ))}
        </Range>
      </PageTitle>

      <Metrics>
        <MetricCard label="Pending submissions" value={m?.pendingSubmissions ?? '—'} delta={m ? `${m.overdueCauses} overdue · avg ${m.avgPendingDays.toFixed(1)}d` : ''} deltaTone={m?.overdueCauses ? 'warning' : 'neutral'} />
        <MetricCard label="Approved causes" value={m?.approvedCauses ?? '—'} delta={m ? <><ArrowUp size={12} />+{m.approvedInRange} this period</> : ''} />
        <MetricCard label="Organizations" value={m?.organizations ?? '—'} delta={m ? `${m.pendingOrgs} awaiting verification` : ''} deltaTone="neutral" />
        <MetricCard label="Open inquiries" value={m?.openInquiries ?? '—'} delta={m ? `${m.unassignedInquiries} unassigned` : ''} deltaTone={m?.unassignedInquiries ? 'error' : 'neutral'} />
      </Metrics>

      <Grid>
        <Panel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <PanelHeading>Submission trends</PanelHeading>
              <PanelSubtitle>Submissions and approvals over the selected range</PanelSubtitle>
            </div>
            <Legend>
              <span><span className="sw" style={{ background: '#0F766E' }} />Submissions</span>
              <span><span className="sw" style={{ background: '#15803D' }} />Approvals</span>
            </Legend>
          </div>
          <Chart>
            <svg viewBox="0 0 700 220" preserveAspectRatio="none">
              <g stroke="#E2E8F0" strokeDasharray="3 4">
                <line x1="0" y1="40" x2="700" y2="40" />
                <line x1="0" y1="90" x2="700" y2="90" />
                <line x1="0" y1="140" x2="700" y2="140" />
                <line x1="0" y1="190" x2="700" y2="190" />
              </g>
              {subPath && <path d={subPath} stroke="#0F766E" strokeWidth={2.5} fill="none" strokeLinejoin="round" />}
              {appPath && <path d={appPath} stroke="#15803D" strokeWidth={2.5} fill="none" strokeDasharray="5 4" strokeLinejoin="round" />}
            </svg>
          </Chart>
        </Panel>

        <Panel>
          <PanelHeading>Queue priorities</PanelHeading>
          <PanelSubtitle>Oldest pending submissions</PanelSubtitle>
          {(!data || data.queuePriorities.length === 0) && (
            <div style={{ padding: 30, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
              {data ? 'Nothing pending.' : 'Loading…'}
            </div>
          )}
          {data?.queuePriorities?.map((q: any) => (
            <QRow key={q.id}>
              <div className="ic" style={{ background: q.organization?.gradient || q.gradient || '#0F766E' }}>
                {(q.organization?.name || q.title).charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="t">{q.title}</div>
                <div className="m">{q.organization?.name || '—'} · <Pill $tone={q.status === 'changes' ? 'info' : 'warning'}>{q.status === 'changes' ? 'Changes' : 'Pending'}</Pill></div>
              </div>
              <div className="r">
                {q.ageHours != null ? `${q.ageHours}h old` : '—'}<br />
                {q.assignedReviewer?.name || 'Unassigned'}
              </div>
            </QRow>
          ))}
        </Panel>
      </Grid>
    </>
  );
}
