'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input } from '@/components/ui/Form';
import { Pill } from '@/components/ui/Pill';
import { dashApi } from '@/lib/dashboard-api';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Card = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 24px;
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 16px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 4px; font-weight: 600; }
  .cs { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-bottom: 18px; }
`;
const Kv = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  font-size: 13px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
  .k { color: ${({ theme }) => theme.colors.muted}; }
  .v { color: ${({ theme }) => theme.colors.ink}; font-weight: 500; text-align: right; }
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

export default function DashSettingsPage() {
  const [me, setMe] = useState<any>(null);
  const [form, setForm] = useState({ name: '', phone: '', country: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [msg, setMsg] = useState<{ t: 'success' | 'error'; m: string; where: 'profile' | 'pw' } | null>(null);

  useEffect(() => {
    dashApi.settings.get().then((d) => {
      setMe(d);
      setForm({ name: d.name, phone: d.phone, country: d.country });
    });
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setMsg(null);
    try {
      const data = await dashApi.settings.patch(form);
      setMe(data);
      setMsg({ t: 'success', m: 'Profile updated.', where: 'profile' });
    } catch (err: any) {
      setMsg({ t: 'error', m: err.message, where: 'profile' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePw(e: React.FormEvent) {
    e.preventDefault();
    setSavingPw(true);
    setMsg(null);
    try {
      await dashApi.settings.changePassword(pw.currentPassword, pw.newPassword);
      setPw({ currentPassword: '', newPassword: '' });
      setMsg({ t: 'success', m: 'Password changed.', where: 'pw' });
    } catch (err: any) {
      setMsg({ t: 'error', m: err.message, where: 'pw' });
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <>
      <SessionTopbar fallbackName="Organization" fallbackInitial="O" fallbackRole="Organization" showOrgInsteadOfRole />
      <Crumbs>Dashboard › Settings</Crumbs>
      <PageTitle>
        <div>
          <H1>Account settings</H1>
          <Muted>Update your personal account information and password.</Muted>
        </div>
      </PageTitle>

      <Grid>
        <Card as="form" onSubmit={saveProfile}>
          <h3>Your profile</h3>
          <div className="cs">Shown to your organization and in reviewer messages.</div>
          {msg?.where === 'profile' && <Banner $tone={msg.t}>{msg.m}</Banner>}
          <Field><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field><Label>Email</Label><Input value={me?.email || ''} disabled /></Field>
          <Field><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
          <Button type="submit" $variant="primary" $size="md" disabled={savingProfile || !me}>
            {savingProfile ? 'Saving…' : 'Save profile'}
          </Button>
        </Card>

        <div>
          <Card>
            <h3>Account</h3>
            <div className="cs">Platform state and verification details.</div>
            <Kv><span className="k">Role</span><span className="v">{me?.role}</span></Kv>
            <Kv><span className="k">Status</span><span className="v">{me ? <Pill $tone={me.status === 'active' ? 'success' : 'warning'}>{me.status}</Pill> : ''}</span></Kv>
            <Kv><span className="k">Email verified</span><span className="v">{me?.emailVerified ? 'Yes' : 'No'}</span></Kv>
            <Kv><span className="k">Two-factor</span><span className="v">{me?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span></Kv>
            <Kv><span className="k">Last sign-in</span><span className="v">{me?.lastSignInAt ? new Date(me.lastSignInAt).toLocaleString() : 'Never'}</span></Kv>
          </Card>

          <Card as="form" onSubmit={changePw} style={{ marginTop: 16 }}>
            <h3>Password</h3>
            <div className="cs">Pick a strong password you don't use elsewhere.</div>
            {msg?.where === 'pw' && <Banner $tone={msg.t}>{msg.m}</Banner>}
            <Field><Label>Current password</Label><Input type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
            <Field><Label>New password</Label><Input type="password" required value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
            <Button type="submit" $variant="primary" $size="md" disabled={savingPw}>
              {savingPw ? 'Changing…' : 'Change password'}
            </Button>
          </Card>
        </div>
      </Grid>
    </>
  );
}
