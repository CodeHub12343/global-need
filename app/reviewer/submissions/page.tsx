'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Search } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Pill, StatusPill } from '@/components/ui/Pill';
import { reviewerApi } from '@/lib/reviewer-api';

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
  select, label { font-size: 13px; }
  select { padding: 8px 12px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; border-radius: 8px; font-family: inherit; background: #fff; }
  label { display: inline-flex; gap: 6px; align-items: center; color: ${({ theme }) => theme.colors.text}; }
`;
const Card = styled.div`
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
  tr:hover td { background: #FAFBFC; cursor: pointer; }
  .cell { display: flex; gap: 10px; align-items: center; min-width: 240px; }
  .im { width: 36px; height: 36px; border-radius: 8px; color: #fff; display: grid; place-items: center; font-weight: 700; font-family: ${({ theme }) => theme.fonts.serif}; flex-shrink: 0; }
  .t { font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
  .s { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
`;

function tone(h: number | null): 'error' | 'warning' | 'info' {
  if (h == null) return 'info';
  if (h >= 48) return 'error';
  if (h >= 24) return 'warning';
  return 'info';
}
function label(h: number | null) {
  if (h == null) return '—';
  if (h >= 48) return `${h}h · overdue`;
  if (h >= 24) return `${h}h`;
  return `${h}h`;
}

export default function ReviewerQueuePage() {
  const [subject, setSubject] = useState<'all' | 'cause' | 'update'>('cause');
  const [status, setStatus] = useState('pending');
  const [mine, setMine] = useState(false);
  const [overdue, setOverdue] = useState(false);
  const [q, setQ] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reviewerApi.queue({ subject, status, mine, overdue, q, limit: 50 })
      .then((d) => { setItems(d.items); setLoading(false); })
      .catch(() => setLoading(false));
  }, [subject, status, mine, overdue, q]);

  return (
    <>
      <SessionTopbar fallbackName="Reviewer" fallbackInitial="R" fallbackRole="Reviewer · Senior" searchPlaceholder="Search submissions…" />
      <Crumbs>Reviewer › Submission queue</Crumbs>
      <PageTitle>
        <div>
          <H1>Submission queue</H1>
          <Muted>Pending causes and progress updates waiting for review.</Muted>
        </div>
      </PageTitle>

      <Controls>
        <div className="fs">
          <Search size={14} />
          <input type="search" placeholder="Filter queue…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select value={subject} onChange={(e) => setSubject(e.target.value as any)}>
          <option value="cause">Causes</option>
          <option value="update">Progress updates</option>
          <option value="all">All subjects</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="changes">Changes</option>
          <option value="all">Both</option>
        </select>
        <label><input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} /> Mine only</label>
        <label><input type="checkbox" checked={overdue} onChange={(e) => setOverdue(e.target.checked)} /> Overdue only</label>
      </Controls>

      <Card>
        <Table>
          <thead>
            <tr>
              <th>Submission</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Age</th>
              <th>Reviewer</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading…</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Nothing in queue.</td></tr>
            )}
            {items.map((r) => {
              const href = r.kind === 'cause' ? `/reviewer/submissions/${r.id}` : `/reviewer/updates/${r.id}`;
              return (
                <tr key={`${r.kind}:${r.id}`} onClick={() => (window.location.href = href)}>
                  <td>
                    <div className="cell">
                      <div className="im" style={{ background: r.organization?.gradient || r.gradient || '#0F766E' }}>
                        {(r.organization?.name || r.title).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="t"><Link href={href} onClick={(e) => e.stopPropagation()} style={{ color: 'inherit', textDecoration: 'none' }}>{r.title}</Link></div>
                        <div className="s">
                          {r.organization?.name || '—'} · {r.publicId || (r.kind === 'update' ? `Update on ${r.cause?.title || ''}` : 'Cause')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><StatusPill status={r.status} /></td>
                  <td>{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}</td>
                  <td><Pill $tone={tone(r.ageHours)}>{label(r.ageHours)}</Pill></td>
                  <td>{r.assignedReviewer?.name || <span style={{ color: '#64748B' }}>Unassigned</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
