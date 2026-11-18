'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { UserPlus, Trash2 } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select } from '@/components/ui/Form';
import { Pill } from '@/components/ui/Pill';
import { dashApi } from '@/lib/dashboard-api';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Card = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  overflow: hidden;
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 16px; color: ${({ theme }) => theme.colors.ink}; padding: 16px 20px; margin: 0; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; font-weight: 600; }
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  th { text-align: left; padding: 10px 20px; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; background: ${({ theme }) => theme.colors.bg}; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
  td { padding: 14px 20px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
  tr:last-child td { border-bottom: none; }
`;
const Side = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 22px;
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 16px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 12px; font-weight: 600; }
`;
const Banner = styled.div<{ $tone: 'success' | 'error' }>`
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 12px;
  background: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success50 : theme.colors.error50)};
  color: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
  border: 1px solid ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
`;

function roleLabel(role: string) {
  if (role === 'org_admin') return 'Admin';
  if (role === 'representative') return 'Representative';
  return role;
}

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', role: 'representative' as 'representative' | 'org_admin' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ t: 'success' | 'error'; m: string } | null>(null);

  async function reload() {
    setLoading(true);
    try { setMembers(await dashApi.team.list()); } finally { setLoading(false); }
  }
  useEffect(() => { reload(); }, []);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await dashApi.team.invite(form);
      setMsg({ t: 'success', m: 'Invitation sent. They will receive a password-set link.' });
      setForm({ name: '', email: '', role: 'representative' });
      reload();
    } catch (err: any) {
      setMsg({ t: 'error', m: err.message });
    } finally {
      setSaving(false);
    }
  }
  async function changeRole(id: string, role: 'representative' | 'org_admin') {
    try { await dashApi.team.patch(id, { role }); reload(); } catch (err: any) { alert(err.message); }
  }
  async function remove(id: string) {
    if (!confirm('Remove this team member from the organization?')) return;
    try { await dashApi.team.remove(id); reload(); } catch (err: any) { alert(err.message); }
  }

  return (
    <>
      <SessionTopbar fallbackName="Organization" fallbackInitial="O" fallbackRole="Organization" showOrgInsteadOfRole />
      <Crumbs>Dashboard › Team members</Crumbs>
      <PageTitle>
        <div>
          <H1>Team members</H1>
          <Muted>Add representatives and admins who can manage your organization on Meeting Global Needs.</Muted>
        </div>
      </PageTitle>

      <Grid>
        <Card>
          <h3>Members ({members.length})</h3>
          <Table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th style={{ width: 70 }} /></tr>
            </thead>
            <tbody>
              {loading && members.length === 0 && <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: '#64748B' }}>Loading…</td></tr>}
              {members.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td style={{ color: '#64748B' }}>{m.email}</td>
                  <td>
                    <Select value={m.role} onChange={(e) => changeRole(m.id, e.target.value as any)} style={{ padding: '6px 10px', fontSize: 12 }}>
                      <option value="representative">Representative</option>
                      <option value="org_admin">Admin</option>
                    </Select>
                  </td>
                  <td>
                    {m.status === 'active'
                      ? <Pill $tone="success">Active</Pill>
                      : <Pill $tone="warning">{m.status}</Pill>}
                  </td>
                  <td>
                    <button
                      aria-label="Remove"
                      onClick={() => remove(m.id)}
                      style={{ border: '1px solid #E5E7EB', background: '#fff', borderRadius: 7, padding: 6, cursor: 'pointer', color: '#64748B' }}
                    ><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Side>
          <h3>Invite a member</h3>
          {msg && <Banner $tone={msg.t}>{msg.m}</Banner>}
          <form onSubmit={invite}>
            <Field><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field>
              <Label>Role</Label>
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })}>
                <option value="representative">Representative</option>
                <option value="org_admin">Admin</option>
              </Select>
            </Field>
            <Button type="submit" $variant="primary" $size="md" $block disabled={saving}>
              <UserPlus size={13} />{saving ? 'Sending…' : 'Send invite'}
            </Button>
          </form>
        </Side>
      </Grid>
    </>
  );
}
