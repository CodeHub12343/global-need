'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Lock, Check, X, Edit2, Shield, FileText, UserPlus, Search } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { adminApi } from '@/lib/admin-api';

const Notice = styled.div`
  background: ${({ theme }) => theme.colors.primary50}; border: 1px solid ${({ theme }) => theme.colors.primary100};
  color: ${({ theme }) => theme.colors.primary800}; padding: 12px 16px; border-radius: 12px; font-size: 13px;
  line-height: 1.55; margin-bottom: 20px; display: flex; gap: 10px;
  svg { color: ${({ theme }) => theme.colors.primary}; flex-shrink: 0; margin-top: 2px; }
`;
const Controls = styled.div`
  background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 12px; padding: 12px 14px;
  display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap;
  .fs { position: relative; flex-grow: 1; min-width: 220px; }
  .fs input { width: 100%; padding: 8px 12px 8px 32px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; border-radius: 8px; font-size: 13px; font-family: ui-monospace, monospace; }
  .fs svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.muted}; }
  select { padding: 8px 12px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; border-radius: 8px; font-size: 13px; background: #fff; }
`;
const TCard = styled.div` background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; overflow: hidden; overflow-x: auto; `;
const T = styled.table`
  width: 100%; border-collapse: collapse; font-size: 13px;
  th { text-align: left; padding: 12px 16px; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; background: ${({ theme }) => theme.colors.bg}; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; white-space: nowrap; }
  td { padding: 11px 16px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; vertical-align: middle; }
`;
const Mono = styled.span` font-family: ui-monospace, monospace; font-size: 12px; color: ${({ theme }) => theme.colors.muted}; `;
const Actor = styled.div`
  display: flex; align-items: center; gap: 10px; min-width: 170px;
  .av { width: 28px; height: 28px; border-radius: 999px; background: #0F766E; color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 11px; flex-shrink: 0; }
  .n { font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
  .r { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; font-weight: 500; }
`;
const Act = styled.span`
  display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600;
  .ai { width: 22px; height: 22px; border-radius: 5px; display: grid; place-items: center; color: #fff; flex-shrink: 0; }
`;

function actionIcon(action: string) {
  if (action.includes('approve') || action.includes('verify')) return { bg: '#15803D', Icon: Check };
  if (action.includes('reject') || action.includes('delete') || action.includes('suspend')) return { bg: '#B91C1C', Icon: X };
  if (action.includes('change') || action.includes('patch')) return { bg: '#B45309', Icon: Edit2 };
  if (action.includes('verification')) return { bg: '#0369A1', Icon: Lock };
  if (action.includes('submit')) return { bg: '#64748B', Icon: FileText };
  if (action.includes('assign') || action.includes('invite')) return { bg: '#64748B', Icon: UserPlus };
  return { bg: '#0F766E', Icon: Shield };
}

export default function AdminAuditLogsPage() {
  const [q, setQ] = useState('');
  const [since, setSince] = useState('30d');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    adminApi.auditLogs.list({ q, since, limit: 100 }).then(setData).catch(() => {});
  }, [q, since]);

  return (
    <>
      <SessionTopbar fallbackName="Admin" fallbackInitial="A" fallbackRole="Super admin" searchPlaceholder="Search audit logs…" />
      <Crumbs>Admin › Audit logs</Crumbs>
      <PageTitle>
        <div>
          <H1>Audit logs</H1>
          <Muted>Every administrative action, verification decision, and privacy-sensitive view. Append-only.</Muted>
        </div>
      </PageTitle>

      <Notice>
        <Lock size={16} />
        <div><strong>Append-only record.</strong> Entries cannot be edited or deleted. Private-document views are logged with record ids rather than content.</div>
      </Notice>

      <Controls>
        <div className="fs">
          <Search size={14} />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="actor, action, record…" />
        </div>
        <select value={since} onChange={(e) => setSince(e.target.value)}>
          <option value="24h">Past 24h</option>
          <option value="7d">Past 7d</option>
          <option value="30d">Past 30d</option>
          <option value="90d">Past 90d</option>
          <option value="year">Past year</option>
          <option value="all">All time</option>
        </select>
      </Controls>

      <TCard>
        <T>
          <thead>
            <tr><th>Timestamp (UTC)</th><th>Actor</th><th>Action</th><th>Affected record</th><th>Log id</th></tr>
          </thead>
          <tbody>
            {!data && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading…</td></tr>}
            {data?.items?.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No log entries match.</td></tr>}
            {data?.items?.map((l: any) => {
              const { bg, Icon } = actionIcon(l.action);
              return (
                <tr key={l.id}>
                  <td><Mono>{new Date(l.createdAt).toISOString().slice(0, 19).replace('T', ' ')}</Mono></td>
                  <td>
                    <Actor>
                      <div className="av">{l.actor.initial}</div>
                      <div>
                        <div className="n">{l.actor.name}</div>
                        <div className="r">{l.actor.role}</div>
                      </div>
                    </Actor>
                  </td>
                  <td>
                    <Act>
                      <span className="ai" style={{ background: bg }}><Icon size={12} /></span>
                      {l.label}
                    </Act>
                  </td>
                  <td style={{ fontSize: 12, color: '#64748B' }}>{l.subjectDescription || '—'}</td>
                  <td><Mono>#{l.id.slice(-6)}</Mono></td>
                </tr>
              );
            })}
          </tbody>
        </T>
      </TCard>
    </>
  );
}
