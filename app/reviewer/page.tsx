'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { ArrowRight, Check } from 'lucide-react';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { H1, Muted } from '@/components/ui/Typography';
import { LinkButton } from '@/components/ui/Button';
import { MetricCard } from '@/components/ui/MetricCard';
import { Panel, PanelHeading, PanelSubtitle } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { reviewerApi } from '@/lib/reviewer-api';

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 22px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const QRow = styled(Link)`
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  align-items: center;
  color: inherit;
  text-decoration: none;
  &:last-child { border-bottom: none; }
  .ic { width: 38px; height: 38px; border-radius: 9px; color: #fff; display: grid; place-items: center; font-weight: 700; font-family: ${({ theme }) => theme.fonts.serif}; flex-shrink: 0; }
  .t { font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; line-height: 1.3; }
  .s { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 3px; }
`;

function ageTone(h: number | null): 'error' | 'warning' | 'info' {
  if (h == null) return 'info';
  if (h >= 48) return 'error';
  if (h >= 24) return 'warning';
  return 'info';
}
function ageLabel(h: number | null, status: string) {
  if (h == null) return status === 'changes' ? 'Changes' : 'Pending';
  if (h >= 48) return 'Overdue';
  if (h >= 24) return 'Pending';
  return status === 'changes' ? 'Changes' : 'Pending';
}

export default function ReviewerOverviewPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => { reviewerApi.overview().then(setData).catch(() => {}); }, []);

  const m = data?.metrics;
  const first = data?.reviewer?.name?.split(' ')[0] || 'there';

  return (
    <>
      <SessionTopbar fallbackName="Reviewer" fallbackInitial="R" fallbackRole="Reviewer · Senior" />
      <Crumbs>Reviewer workspace › Overview</Crumbs>
      <PageTitle>
        <div>
          <H1>Good morning, {first}</H1>
          <Muted>
            {m
              ? `${m.assigned} assigned · ${m.overdue} overdue · ${m.queueCauses + m.queueUpdates} total in queue`
              : 'Loading your workload…'}
          </Muted>
        </div>
        <LinkButton as={Link} href="/reviewer/submissions" $variant="primary" $size="md">
          Start next review <ArrowRight size={14} />
        </LinkButton>
      </PageTitle>

      <Metrics>
        <MetricCard label="Assigned to you" value={m?.assigned ?? '—'} delta={m ? `${m.assignedCauses} causes · ${m.assignedUpdates} updates` : ''} deltaTone="neutral" />
        <MetricCard label="Overdue · 48h+" value={m?.overdue ?? '—'} delta={m?.overdue ? 'Prioritize these first' : 'All on time'} deltaTone={m?.overdue ? 'warning' : 'neutral'} />
        <MetricCard label="Completed · 7d" value={m?.done7d ?? '—'} delta={m ? `${m.approved7d} approved · ${m.changes7d} changes · ${m.rejected7d} rejected` : ''} />
        <MetricCard
          label="Avg decision time"
          value={m?.avgDecisionDays != null ? <>{m.avgDecisionDays.toFixed(1)}<span style={{ fontSize: 18, color: '#64748B', fontWeight: 500 }}>d</span></> : '—'}
          delta={m?.pendingOrgs ? `${m.pendingOrgs} organizations pending verification` : 'No orgs pending'}
        />
      </Metrics>

      <Grid>
        <Panel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <PanelHeading>Review queue</PanelHeading>
              <PanelSubtitle>Oldest pending submissions across all reviewers</PanelSubtitle>
            </div>
            <Link href="/reviewer/submissions" style={{ fontSize: 13, fontWeight: 600, color: '#115E59' }}>Open queue â†’</Link>
          </div>
          {(!data || data.queueOldest?.length === 0) && (
            <div style={{ padding: 30, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
              {data ? 'No pending submissions.' : 'Loading…'}
            </div>
          )}
          {data?.queueOldest?.map((q: any) => (
            <QRow key={q.id} href={`/reviewer/submissions/${q.id}`}>
              <div className="ic" style={{ background: q.organization?.gradient || q.gradient || '#0F766E' }}>
                {(q.organization?.name || q.title).charAt(0).toUpperCase()}
              </div>
              <div style={{ flexGrow: 1 }}>
                <div className="t">{q.title}</div>
                <div className="s">
                  {q.organization?.name || '—'} · {q.publicId || 'pending id'} · {q.ageHours != null ? `${q.ageHours}h old` : 'new'}
                  {q.assignedReviewer ? ` · ${q.assignedReviewer.name}` : ' · Unassigned'}
                </div>
              </div>
              <Pill $tone={ageTone(q.ageHours)}>{ageLabel(q.ageHours, q.status)}</Pill>
            </QRow>
          ))}
        </Panel>
        <Panel>
          <PanelHeading>Review reminders</PanelHeading>
          <PanelSubtitle>Policies to keep in mind</PanelSubtitle>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Check size={13} strokeWidth={3} style={{ color: '#0F766E', flexShrink: 0, marginTop: 2 }} />
              Never share private document contents outside the review tool
            </li>
            <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Check size={13} strokeWidth={3} style={{ color: '#0F766E', flexShrink: 0, marginTop: 2 }} />
              Reject never reveals private evidence — stick to policy reasons
            </li>
            <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Check size={13} strokeWidth={3} style={{ color: '#0F766E', flexShrink: 0, marginTop: 2 }} />
              Request changes with specifics so the organization can act
            </li>
          </ul>
        </Panel>
      </Grid>
    </>
  );
}
