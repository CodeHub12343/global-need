'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  Check,
  Plus,
  ArrowUp,
  MessageSquare,
  LineChart,
  FilePlus,
  FileText,
  Upload,
} from 'lucide-react';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { H1, Muted } from '@/components/ui/Typography';
import { LinkButton } from '@/components/ui/Button';
import { MetricCard } from '@/components/ui/MetricCard';
import { Panel, PanelHeading, PanelSubtitle } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { dashApi } from '@/lib/dashboard-api';

const Welcome = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary50}, ${({ theme }) => theme.colors.accent50});
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  .t { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 19px; color: ${({ theme }) => theme.colors.ink}; font-weight: 600; }
  .s { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; margin-top: 4px; }
`;
const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Activity = styled.div`
  .act { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; align-items: center; &:last-child { border-bottom: none; }
    .ic { width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; flex-shrink: 0; }
    .ic.a { background: ${({ theme }) => theme.colors.success50}; color: ${({ theme }) => theme.colors.success}; }
    .ic.w { background: ${({ theme }) => theme.colors.warning50}; color: ${({ theme }) => theme.colors.warning}; }
    .ic.n { background: ${({ theme }) => theme.colors.primary50}; color: ${({ theme }) => theme.colors.primary700}; }
    .t { font-size: 13px; color: ${({ theme }) => theme.colors.ink}; font-weight: 600; }
    .m { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
    .tm { margin-left: auto; font-size: 11px; color: ${({ theme }) => theme.colors.muted2}; flex-shrink: 0; }
  }
`;
const Quick = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  .qb { padding: 14px; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 10px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; background: #fff; text-decoration: none; color: inherit; cursor: pointer;
    &:hover { border-color: ${({ theme }) => theme.colors.primary}; background: ${({ theme }) => theme.colors.primary50}; }
    .qi { width: 30px; height: 30px; border-radius: 7px; background: ${({ theme }) => theme.colors.primary50}; color: ${({ theme }) => theme.colors.primary}; display: grid; place-items: center; }
    .qt { font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
    .qs { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; }
  }
`;

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.max(1, Math.round(ms / 60e3));
  if (m < 60) return `${m}m ago`;
  const h = Math.round(ms / 3600e3);
  if (h < 48) return `${h}h ago`;
  const d = Math.round(ms / 86400e3);
  if (d < 14) return `${d}d ago`;
  return `${Math.round(d / 7)}w ago`;
}

export default function DashOverviewPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    dashApi.overview().then(setData).catch(() => {});
  }, []);

  const org = data?.organization;
  const m = data?.metrics;
  const activity: any[] = data?.activity || [];
  const verified = org?.status === 'verified';

  return (
    <>
      <SessionTopbar
        searchPlaceholder="Search causes, inquiries…"
        fallbackName="Organization"
        fallbackInitial="O"
        fallbackRole="Organization"
        showOrgInsteadOfRole
      />
      <Crumbs>Dashboard › Overview</Crumbs>
      <PageTitle>
        <div>
          <H1>Welcome back{data?.organization ? '' : '…'}</H1>
          <Muted>Here's what's happening with your organization this week.</Muted>
        </div>
        <LinkButton as={Link} href="/dashboard/causes/new" $variant="primary" $size="md">
          <Plus size={14} />
          Submit a new cause
        </LinkButton>
      </PageTitle>

      <Welcome>
        <div>
          <div className="t">
            {verified
              ? 'Your organization is approved and active'
              : org?.status === 'pending'
                ? 'Your organization is under review'
                : 'Organization status'}
          </div>
          <div className="s">
            {verified
              ? 'Submissions published appear on the public site with a verified badge.'
              : 'You can still prepare drafts while your organization is being verified.'}
          </div>
        </div>
        <Pill $tone={verified ? 'success' : 'warning'}>
          <Check size={11} strokeWidth={3} />
          {verified ? 'Verified' : (org?.status || 'Pending')}
        </Pill>
      </Welcome>

      <Metrics>
        <MetricCard label="Total causes" value={m?.totalCauses ?? '—'} delta={m?.draftCauses ? `${m.draftCauses} drafts` : 'No drafts'} />
        <MetricCard label="Published" value={m?.publishedCauses ?? '—'} delta="On the public site" />
        <MetricCard label="Pending review" value={m?.pendingCauses ?? '—'} delta={m?.changesCauses ? `${m.changesCauses} changes requested` : 'Awaiting reviewer'} deltaTone={m?.changesCauses ? 'warning' : 'neutral'} />
        <MetricCard label="Inquiries · 30d" value={m?.inquiries30d ?? '—'} delta={m?.awaitingInquiries ? `${m.awaitingInquiries} awaiting reply` : 'All caught up'} />
      </Metrics>

      <Grid>
        <Panel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <PanelHeading>Recent activity</PanelHeading>
              <PanelSubtitle>Most recent events across your causes and submissions</PanelSubtitle>
            </div>
            <Link href="/dashboard/causes" style={{ fontSize: 13, fontWeight: 600, color: '#115E59' }}>View all</Link>
          </div>
          <Activity>
            {activity.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
                {data ? 'No recent activity yet.' : 'Loading activity…'}
              </div>
            )}
            {activity.map((a: any, i: number) => (
              <div className="act" key={i}>
                <div className={`ic ${a.kind === 'approved' ? 'a' : a.kind === 'warning' ? 'w' : 'n'}`}>
                  {a.kind === 'approved' ? <Check size={16} strokeWidth={2.4} /> : a.kind === 'warning' ? <FilePlus size={16} /> : <MessageSquare size={16} />}
                </div>
                <div>
                  <div className="t">{a.title}</div>
                  <div className="m">{a.meta}</div>
                </div>
                <span className="tm">{relativeTime(a.at)}</span>
              </div>
            ))}
          </Activity>
        </Panel>

        <Panel>
          <PanelHeading>Quick actions</PanelHeading>
          <PanelSubtitle>Jump to common tasks</PanelSubtitle>
          <Quick>
            <Link href="/dashboard/causes/new" className="qb">
              <div className="qi"><Plus size={14} /></div>
              <div className="qt">New cause</div>
              <div className="qs">Begin a submission</div>
            </Link>
            <Link href="/dashboard/updates" className="qb">
              <div className="qi"><LineChart size={14} /></div>
              <div className="qt">Post an update</div>
              <div className="qs">On a published cause</div>
            </Link>
            <Link href="/dashboard/inquiries" className="qb">
              <div className="qi"><MessageSquare size={14} /></div>
              <div className="qt">Reply inquiries</div>
              <div className="qs">{m?.awaitingInquiries ? `${m.awaitingInquiries} awaiting` : 'All caught up'}</div>
            </Link>
            <Link href="/dashboard/documents" className="qb">
              <div className="qi"><Upload size={14} /></div>
              <div className="qt">Upload docs</div>
              <div className="qs">Supporting files</div>
            </Link>
          </Quick>
        </Panel>
      </Grid>
    </>
  );
}
