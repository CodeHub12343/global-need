'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { MetricCard } from '@/components/ui/MetricCard';
import { adminApi } from '@/lib/admin-api';

const Summary = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 22px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
`;
const Cards = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; }
`;
const RC = styled.div`
  background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; padding: 22px;
  .hd { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .lg { width: 56px; height: 56px; border-radius: 12px; color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 20px; font-family: ${({ theme }) => theme.fonts.serif}; flex-shrink: 0; }
  .n { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 17px; font-weight: 600; margin: 0; }
  .r { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-top: 3px; }
  .caps { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
  .cap { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 999px; background: ${({ theme }) => theme.colors.bg}; color: ${({ theme }) => theme.colors.text}; }
  .avail { display: flex; justify-content: space-between; padding: 10px 12px; border-radius: 9px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
  .avail.on { background: ${({ theme }) => theme.colors.success50}; color: ${({ theme }) => theme.colors.success}; }
  .avail.off { background: ${({ theme }) => theme.colors.bgSoft}; color: ${({ theme }) => theme.colors.muted}; }
  .load .bar { height: 8px; background: ${({ theme }) => theme.colors.bgSoft}; border-radius: 999px; margin-top: 6px; overflow: hidden; }
  .load .bar span { display: block; height: 100%; background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primary800}); }
  .load .bar span.hot { background: linear-gradient(90deg, #B45309, #92400E); }
  .load .ll { display: flex; justify-content: space-between; font-size: 11px; color: ${({ theme }) => theme.colors.muted}; }
`;

export default function AdminReviewersPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { adminApi.reviewers.list().then(setData).catch(() => {}); }, []);

  return (
    <>
      <SessionTopbar fallbackName="Admin" fallbackInitial="A" fallbackRole="Super admin" />
      <Crumbs>Admin › Reviewers</Crumbs>
      <PageTitle>
        <div>
          <H1>Reviewer management</H1>
          <Muted>Manage reviewer accounts, capabilities, workload and availability.</Muted>
        </div>
      </PageTitle>

      <Summary>
        <MetricCard label="Active reviewers" value={data?.metrics?.active ?? '—'} />
        <MetricCard label="On leave" value={data?.metrics?.onLeave ?? '—'} />
        <MetricCard label="Open assignments" value={data?.metrics?.openAssignments ?? '—'} />
        <MetricCard label="Total reviewers" value={data?.items?.length ?? '—'} />
      </Summary>

      <Cards>
        {!data && <div style={{ padding: 30, color: '#64748B' }}>Loading…</div>}
        {data?.items?.length === 0 && <div style={{ padding: 30, color: '#64748B' }}>No reviewers seeded yet.</div>}
        {data?.items?.map((r: any) => (
          <RC key={r.id}>
            <div className="hd">
              <div className="lg" style={{ background: r.gradient }}>{r.initials}</div>
              <div>
                <div className="n">{r.name}</div>
                <div className="r">{r.email} · {r.level === 'senior' ? 'Senior reviewer' : 'Reviewer'}</div>
              </div>
            </div>
            <div className="caps">
              {r.capabilities.length === 0 && <span className="cap">No capabilities set</span>}
              {r.capabilities.map((c: string) => <span key={c} className="cap">{c}</span>)}
            </div>
            <div className={`avail ${r.available ? 'on' : 'off'}`}>
              <span>{r.available ? 'Available' : 'Unavailable'}</span>
              <span>âš¡ {r.load} open · {r.decisions90d} decisions · 90d</span>
            </div>
            <div className="load">
              <div className="ll"><span>Workload</span><span>{r.load} / {r.capacity}</span></div>
              <div className="bar"><span className={r.loadHot ? 'hot' : ''} style={{ width: `${Math.min(100, (r.load / Math.max(1, r.capacity)) * 100)}%` }} /></div>
            </div>
          </RC>
        ))}
      </Cards>
    </>
  );
}
