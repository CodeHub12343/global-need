'use client';

import { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Panel, PanelHeading, PanelSubtitle } from '@/components/ui/Card';
import { adminApi } from '@/lib/admin-api';

const Range = styled.div`
  display: flex; gap: 4px; background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 10px; padding: 4px;
  button { padding: 6px 12px; border-radius: 7px; border: none; background: none; font-size: 12px; font-weight: 600; color: ${({ theme }) => theme.colors.muted}; cursor: pointer; font-family: inherit; }
  button.on { background: ${({ theme }) => theme.colors.primary50}; color: ${({ theme }) => theme.colors.primary800}; }
`;
const Kpis = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 22px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
`;
const K = styled.div`
  background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; padding: 22px;
  .l { font-size: 12px; font-weight: 600; color: ${({ theme }) => theme.colors.muted}; text-transform: uppercase; letter-spacing: 0.06em; }
  .n { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 32px; font-weight: 600; margin-top: 8px; }
  .d { margin-top: 6px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 3px; }
  .d.up { color: ${({ theme }) => theme.colors.success}; }
  .d.dn { color: ${({ theme }) => theme.colors.error}; }
  .d.n { color: ${({ theme }) => theme.colors.muted}; }
`;
const Grid2 = styled.div`
  display: grid; grid-template-columns: 2fr 1fr; gap: 18px; margin-bottom: 18px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Chart = styled.div` height: 240px; margin-top: 6px; svg { width: 100%; height: 100%; } `;
const Bars = styled.div`
  display: grid; grid-template-columns: 140px 1fr 60px; row-gap: 10px; column-gap: 10px; align-items: center; font-size: 13px;
  .cat { color: ${({ theme }) => theme.colors.ink}; font-weight: 500; }
  .bar { height: 16px; background: ${({ theme }) => theme.colors.bgSoft}; border-radius: 6px; overflow: hidden; }
  .bar span { display: block; height: 100%; background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primary800}); border-radius: 6px; }
  .cnt { text-align: right; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; }
`;
const Tbl = styled.table`
  width: 100%; border-collapse: collapse; font-size: 13px;
  th { text-align: left; padding: 10px 12px; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
  td { padding: 12px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
`;
const DonutGrid = styled.div`
  display: grid; grid-template-columns: 140px 1fr; gap: 18px; align-items: center;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; }
`;
const CatList = styled.div`
  display: flex; flex-direction: column; gap: 10px;
  .cl { display: flex; align-items: center; gap: 10px; font-size: 13px; }
  .dot { width: 10px; height: 10px; border-radius: 3px; }
  .n { margin-left: auto; font-weight: 600; }
  .p { color: ${({ theme }) => theme.colors.muted}; font-size: 12px; min-width: 36px; text-align: right; }
`;

const PALETTE = ['#0F766E', '#B45309', '#5B21B6', '#0E7490', '#9A3412', '#166534', '#DB2777', '#1E40AF'];

export default function AdminReportsPage() {
  const [range, setRange] = useState('90d');
  const [data, setData] = useState<any>(null);
  useEffect(() => { adminApi.reports(range).then(setData).catch(() => {}); }, [range]);

  const weekly = data?.weekly;
  const maxW = weekly ? Math.max(1, ...weekly.submitted, ...weekly.approved) : 1;
  const barW = weekly ? (800 / weekly.weeks) : 0;

  const byCat = data?.byCategory;
  const total = byCat?.total || 0;
  const maxReviewer = data?.reviewerTimes ? Math.max(1, ...data.reviewerTimes.map((r: any) => r.medianDays)) : 1;

  function donutSegments(items: any[], tot: number) {
    if (!tot) return [];
    let offset = 0;
    return items.map((it: any, i: number) => {
      const pct = (it.count / tot) * 100;
      const seg = { dash: pct, offset: 25 - offset, color: PALETTE[i % PALETTE.length], count: it.count, pct, label: it.category };
      offset += pct;
      return seg;
    });
  }
  const donut = byCat ? donutSegments(byCat.items.slice(0, 8), total) : [];

  return (
    <>
      <SessionTopbar fallbackName="Admin" fallbackInitial="A" fallbackRole="Super admin" />
      <Crumbs>Admin › Reports &amp; analytics</Crumbs>
      <PageTitle>
        <div><H1>Reports &amp; analytics</H1><Muted>Operational metrics only — submissions, approvals, response times.</Muted></div>
        <Range>
          {['7d', '30d', '90d', 'year'].map((r) => (
            <button key={r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r === 'year' ? 'Year' : r}</button>
          ))}
        </Range>
      </PageTitle>

      <Kpis>
        <K><div className="l">Submissions</div><div className="n">{data?.kpis?.submissions ?? '—'}</div>
          <div className={`d ${data?.kpis?.submittedDelta == null ? 'n' : data.kpis.submittedDelta >= 0 ? 'up' : 'dn'}`}>
            {data?.kpis?.submittedDelta != null && (data.kpis.submittedDelta >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
            {data?.kpis?.submittedDelta != null ? `${data.kpis.submittedDelta >= 0 ? '+' : ''}${data.kpis.submittedDelta}% vs prior` : '—'}
          </div>
        </K>
        <K><div className="l">Approved</div><div className="n">{data?.kpis?.approved ?? '—'}</div>
          <div className="d n">{data?.kpis?.approvalRate != null ? `${data.kpis.approvalRate}% approval rate` : '—'}</div>
        </K>
        <K><div className="l">Avg review time</div><div className="n">{data?.kpis?.avgReviewDays ?? '—'}<span style={{ fontSize: 18, color: '#64748B', fontWeight: 500 }}>d</span></div>
          <div className="d n">Across decided submissions</div>
        </K>
        <K><div className="l">Inquiries</div><div className="n">{data?.kpis?.inquiries ?? '—'}</div>
          <div className={`d ${data?.kpis?.inquiriesDelta == null ? 'n' : data.kpis.inquiriesDelta >= 0 ? 'up' : 'dn'}`}>
            {data?.kpis?.inquiriesDelta != null && (data.kpis.inquiriesDelta >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
            {data?.kpis?.inquiriesDelta != null ? `${data.kpis.inquiriesDelta >= 0 ? '+' : ''}${data.kpis.inquiriesDelta}% vs prior` : '—'}
          </div>
        </K>
      </Kpis>

      <Grid2>
        <Panel>
          <PanelHeading>Submissions &amp; approvals</PanelHeading>
          <PanelSubtitle>Weekly volume over the last {weekly?.weeks || 12} weeks</PanelSubtitle>
          <Chart>
            {weekly && (
              <svg viewBox="0 0 800 240" preserveAspectRatio="none">
                <g stroke="#E2E8F0" strokeDasharray="3 4">
                  <line x1="0" y1="40" x2="800" y2="40" />
                  <line x1="0" y1="100" x2="800" y2="100" />
                  <line x1="0" y1="160" x2="800" y2="160" />
                  <line x1="0" y1="200" x2="800" y2="200" />
                </g>
                <g fill="#0F766E" opacity={0.85}>
                  {weekly.submitted.map((v: number, i: number) => {
                    const h = Math.round((v / maxW) * 180);
                    return <rect key={i} x={i * barW + 10} y={210 - h} width={barW / 2 - 4} height={h} rx={3} />;
                  })}
                </g>
                <g fill="#15803D" opacity={0.85}>
                  {weekly.approved.map((v: number, i: number) => {
                    const h = Math.round((v / maxW) * 180);
                    return <rect key={i} x={i * barW + barW / 2 + 10} y={210 - h} width={barW / 2 - 4} height={h} rx={3} />;
                  })}
                </g>
              </svg>
            )}
          </Chart>
        </Panel>

        <Panel>
          <PanelHeading>By category</PanelHeading>
          <PanelSubtitle>Approved causes</PanelSubtitle>
          <DonutGrid>
            <svg viewBox="0 0 42 42" style={{ width: 140, height: 140 }}>
              <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#F1F5F9" strokeWidth="8" />
              {donut.map((s: any, i: number) => (
                <circle key={i} cx="21" cy="21" r="15.9155" fill="transparent" stroke={s.color} strokeWidth="8" strokeDasharray={`${s.dash} ${100 - s.dash}`} strokeDashoffset={s.offset} transform="rotate(-90 21 21)" />
              ))}
            </svg>
            <CatList>
              {donut.length === 0 && <div style={{ color: '#64748B', fontSize: 13 }}>No approved causes yet.</div>}
              {donut.map((s: any, i: number) => (
                <div key={i} className="cl"><span className="dot" style={{ background: s.color }} /><span style={{ textTransform: 'capitalize' }}>{s.label?.replace('-', ' ')}</span><span className="n">{s.count}</span><span className="p">{Math.round(s.pct)}%</span></div>
              ))}
            </CatList>
          </DonutGrid>
        </Panel>
      </Grid2>

      <Grid2>
        <Panel>
          <PanelHeading>Reviewer response times</PanelHeading>
          <PanelSubtitle>Median days to first decision · in-range</PanelSubtitle>
          <Bars>
            {data?.reviewerTimes?.length === 0 && <div style={{ color: '#64748B', fontSize: 13 }}>No reviewer decisions yet.</div>}
            {data?.reviewerTimes?.map((r: any) => (
              <Fragment key={r.name}>
                <span className="cat">{r.name}</span>
                <div className="bar"><span style={{ width: `${(r.medianDays / maxReviewer) * 100}%` }} /></div>
                <span className="cnt">{r.medianDays}d</span>
              </Fragment>
            ))}
          </Bars>
        </Panel>

        <Panel>
          <PanelHeading>Inquiry types</PanelHeading>
          <PanelSubtitle>Received in range</PanelSubtitle>
          <Tbl>
            <thead><tr><th>Type</th><th style={{ textAlign: 'right' }}>Count</th><th style={{ textAlign: 'right' }}>Replied</th></tr></thead>
            <tbody>
              {!data && <tr><td colSpan={3} style={{ color: '#64748B' }}>Loading…</td></tr>}
              {data?.inquiryTypes?.length === 0 && <tr><td colSpan={3} style={{ color: '#64748B' }}>No inquiries.</td></tr>}
              {data?.inquiryTypes?.map((r: any) => (
                <tr key={r.type}><td style={{ textTransform: 'capitalize' }}>{r.type}</td><td style={{ textAlign: 'right' }}>{r.count}</td><td style={{ textAlign: 'right' }}>{r.repliedPct}%</td></tr>
              ))}
            </tbody>
          </Tbl>
        </Panel>
      </Grid2>
    </>
  );
}
