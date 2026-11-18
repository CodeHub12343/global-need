'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Search, Check } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Pill } from '@/components/ui/Pill';
import { MetricCard } from '@/components/ui/MetricCard';
import { adminApi } from '@/lib/admin-api';

const Metrics = styled.div`
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 22px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
`;
const Tabs = styled.div`
  display: flex; gap: 4px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; margin-bottom: 16px; overflow-x: auto;
`;
const Tab = styled.button<{ $active?: boolean }>`
  padding: 10px 14px; font-size: 13px; font-weight: 600;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary700 : theme.colors.muted)};
  border: none; border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary700 : 'transparent')};
  background: none; cursor: pointer; font-family: inherit;
  .tc { background: ${({ $active, theme }) => ($active ? theme.colors.primary100 : theme.colors.bgSoft)}; color: ${({ $active, theme }) => ($active ? theme.colors.primary800 : theme.colors.muted)}; padding: 1px 7px; border-radius: 999px; font-size: 11px; font-weight: 700; margin-left: 6px; }
`;
const Controls = styled.div`
  background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 12px; padding: 12px 14px;
  display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap;
  .fs { position: relative; flex-grow: 1; min-width: 220px; }
  .fs input { width: 100%; padding: 8px 12px 8px 32px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; border-radius: 8px; font-size: 13px; font-family: inherit; }
  .fs svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.muted}; }
  select { padding: 8px 12px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; border-radius: 8px; font-size: 13px; background: #fff; }
`;
const TCard = styled.div` background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; overflow: hidden; overflow-x: auto; `;
const T = styled.table`
  width: 100%; border-collapse: collapse; font-size: 13px;
  th { text-align: left; padding: 12px 16px; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; background: ${({ theme }) => theme.colors.bg}; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; white-space: nowrap; }
  td { padding: 14px 16px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.ink}; vertical-align: middle; }
  select { padding: 4px 8px; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 6px; font-size: 12px; font-family: inherit; background: #fff; }
`;
const Person = styled.div`
  display: flex; align-items: center; gap: 12px; min-width: 220px;
  .av { width: 36px; height: 36px; border-radius: 999px; background: #0F766E; color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
  .n { font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
  .em { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
`;

const TABS = [
  { v: 'all', l: 'All' }, { v: 'rep', l: 'Representatives' }, { v: 'sup', l: 'Supporters' },
  { v: 'rev', l: 'Reviewers' }, { v: 'admin', l: 'Administrators' }, { v: 'suspended', l: 'Suspended' },
];

export default function AdminUsersPage() {
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function reload() {
    const d = await adminApi.users.list({ tab, q, limit: 50 });
    setData(d);
  }
  useEffect(() => { reload(); }, [tab, q]);

  async function patch(id: string, payload: any) {
    setBusy(id);
    try { await adminApi.users.patch(id, payload); await reload(); } finally { setBusy(null); }
  }

  const c = data?.countsByRole || {};
  const totals = {
    all: data?.total ?? 0,
    rep: c.representative || 0,
    sup: c.supporter || 0,
    rev: (c.reviewer || 0) + (c.senior_reviewer || 0),
    admin: (c.org_admin || 0) + (c.super_admin || 0),
    suspended: 0,
  };

  return (
    <>
      <SessionTopbar fallbackName="Admin" fallbackInitial="A" fallbackRole="Super admin" searchPlaceholder="Search users…" />
      <Crumbs>Admin › Users</Crumbs>
      <PageTitle>
        <div>
          <H1>User management</H1>
          <Muted>All platform accounts across roles. Impersonation is logged.</Muted>
        </div>
      </PageTitle>

      <Metrics>
        <MetricCard label="Total users" value={totals.all} />
        <MetricCard label="Representatives" value={totals.rep} />
        <MetricCard label="Supporters" value={totals.sup} />
        <MetricCard label="Reviewers" value={totals.rev} />
        <MetricCard label="Administrators" value={totals.admin} />
      </Metrics>

      <Tabs>
        {TABS.map((t) => (
          <Tab key={t.v} $active={tab === t.v} onClick={() => setTab(t.v)}>
            {t.l}<span className="tc">{(totals as any)[t.v] ?? 0}</span>
          </Tab>
        ))}
      </Tabs>

      <Controls>
        <div className="fs">
          <Search size={14} />
          <input type="search" placeholder="Filter by name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </Controls>

      <TCard>
        <T>
          <thead>
            <tr>
              <th>User</th><th>Role</th><th>Organization</th><th>Status</th><th>2FA</th><th>Last sign-in</th>
            </tr>
          </thead>
          <tbody>
            {!data && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading…</td></tr>}
            {data?.items?.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No users found.</td></tr>}
            {data?.items?.map((u: any) => (
              <tr key={u.id}>
                <td>
                  <Person>
                    <div className="av">{u.initial}</div>
                    <div>
                      <div className="n">{u.name}</div>
                      <div className="em">{u.email}</div>
                    </div>
                  </Person>
                </td>
                <td>
                  <select disabled={busy === u.id} value={u.role} onChange={(e) => patch(u.id, { role: e.target.value })}>
                    <option value="supporter">Supporter</option>
                    <option value="representative">Representative</option>
                    <option value="org_admin">Org admin</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="senior_reviewer">Senior reviewer</option>
                    <option value="super_admin">Super admin</option>
                  </select>
                </td>
                <td>{u.organization?.name || '—'}</td>
                <td>
                  <select disabled={busy === u.id} value={u.status} onChange={(e) => patch(u.id, { status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </td>
                <td style={{ color: u.twoFactorEnabled ? '#15803D' : '#64748B', fontWeight: 600 }}>{u.twoFactorEnabled ? 'On' : 'Off'}</td>
                <td>{u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </T>
      </TCard>
    </>
  );
}
