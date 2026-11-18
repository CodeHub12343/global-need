'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AlertTriangle } from 'lucide-react';
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
  background: none; cursor: pointer; font-family: inherit; white-space: nowrap;
  .tc { background: ${({ $active, theme }) => ($active ? theme.colors.primary100 : theme.colors.bgSoft)}; color: ${({ $active, theme }) => ($active ? theme.colors.primary800 : theme.colors.muted)}; padding: 1px 7px; border-radius: 999px; font-size: 11px; font-weight: 700; margin-left: 6px; }
`;
const Cards = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Card = styled.div` background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; overflow: hidden; `;
const Ch = styled.div`
  padding: 16px 18px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  .cause { font-size: 11px; font-weight: 700; color: ${({ theme }) => theme.colors.primary}; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 3px; }
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 17px; margin: 0; line-height: 1.3; font-weight: 600; }
  .by { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 4px; }
`;
const Cb = styled.div`
  padding: 16px 18px;
  p { font-size: 13px; color: ${({ theme }) => theme.colors.text}; margin: 0 0 12px; line-height: 1.55; }
  .meta { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; }
`;
const Flag = styled.div`
  background: ${({ theme }) => theme.colors.warning50}; border: 1px solid #fde68a;
  color: ${({ theme }) => theme.colors.warning}; padding: 8px 10px; border-radius: 8px; font-size: 11px;
  margin-bottom: 10px; display: flex; gap: 6px; align-items: flex-start;
  svg { flex-shrink: 0; margin-top: 2px; }
`;

const TABS = [
  { v: 'pending', l: 'Pending review' }, { v: 'flagged', l: 'With flagged media' },
  { v: 'changes', l: 'Changes outstanding' }, { v: 'today', l: 'Approved today' },
];

export default function AdminUpdatesPage() {
  const [tab, setTab] = useState('pending');
  const [data, setData] = useState<any>(null);

  useEffect(() => { adminApi.updates.list({ tab }).then(setData).catch(() => {}); }, [tab]);

  return (
    <>
      <SessionTopbar fallbackName="Admin" fallbackInitial="A" fallbackRole="Super admin" />
      <Crumbs>Admin › Update moderation</Crumbs>
      <PageTitle>
        <div>
          <H1>Progress update moderation</H1>
          <Muted>Approve or request changes on progress updates. Decisions happen in the reviewer workspace; this page surfaces the queue and flagged items.</Muted>
        </div>
      </PageTitle>

      <Tabs>
        {TABS.map((t) => (
          <Tab key={t.v} $active={tab === t.v} onClick={() => setTab(t.v)}>
            {t.l}<span className="tc">{data?.counts?.[t.v] ?? 0}</span>
          </Tab>
        ))}
      </Tabs>

      <Cards>
        {!data && <div style={{ padding: 30, color: '#64748B' }}>Loading…</div>}
        {data?.items?.length === 0 && <div style={{ padding: 30, color: '#64748B' }}>No updates in this tab.</div>}
        {data?.items?.map((u: any) => (
          <Card key={u.id}>
            <Ch>
              <div>
                <div className="cause">{u.cause?.title || 'Cause'}</div>
                <h3>{u.title}</h3>
                <div className="by">{u.organization?.name || '—'} · {u.author?.name || '—'} · {u.submittedAt ? new Date(u.submittedAt).toLocaleString() : '—'}</div>
              </div>
              <Pill $tone={u.status === 'changes' ? 'info' : u.status === 'approved' ? 'success' : 'warning'}>
                {u.status === 'changes' ? 'Changes' : u.status === 'approved' ? 'Approved' : 'Pending'}
              </Pill>
            </Ch>
            <Cb>
              {u.flagged && (
                <Flag>
                  <AlertTriangle size={13} />
                  <div><strong>Review needed:</strong> {u.flagReason || 'Flagged for consent re-check.'}</div>
                </Flag>
              )}
              <p>{u.body}</p>
              <div className="meta">
                {u.mediaCount} media · {u.consentLogAttached ? 'Consent log attached' : 'No consent log'}
              </div>
            </Cb>
          </Card>
        ))}
      </Cards>
    </>
  );
}
