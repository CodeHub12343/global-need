'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Form';
import { adminApi } from '@/lib/admin-api';

const Content = styled.div` display: flex; flex-direction: column; gap: 18px; `;
const Card = styled.div`
  background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; padding: 26px;
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 18px; margin: 0 0 4px; font-weight: 600; }
  .cs { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; margin-bottom: 18px; }
`;
const Row = styled.div`
  display: grid; grid-template-columns: 240px 1fr; gap: 20px; padding: 16px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border}; align-items: flex-start;
  &:first-of-type { border-top: none; padding-top: 0; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; gap: 10px; }
  .l { font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
  .h { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-top: 4px; line-height: 1.5; }
`;
const Toggle = styled.span<{ $on?: boolean }>`
  position: relative; width: 38px; height: 22px;
  background: ${({ $on, theme }) => ($on ? theme.colors.primary : theme.colors.border)};
  border-radius: 999px; cursor: pointer; display: inline-block; flex-shrink: 0;
  &::after { content: ''; position: absolute; top: 3px; left: ${({ $on }) => ($on ? '19px' : '3px')}; width: 16px; height: 16px; background: #fff; border-radius: 999px; transition: all 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
`;
const TogRow = styled.div`
  display: flex; align-items: center; gap: 10px; font-size: 13px; color: ${({ theme }) => theme.colors.text};
`;
const SaveBar = styled.div`
  position: sticky; bottom: 0; background: #fff; border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 -4px 12px rgba(0,0,0,.05); gap: 10px; flex-wrap: wrap;
  .msg { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; b { color: ${({ theme }) => theme.colors.ink}; } }
  .acts { display: flex; gap: 8px; }
`;

type Vals = Record<string, any>;

export default function AdminSettingsPage() {
  const [initial, setInitial] = useState<Vals | null>(null);
  const [values, setValues] = useState<Vals>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    adminApi.settings.get().then((d: any) => { setInitial(d.values); setValues(d.values); }).catch(() => {});
  }, []);

  function set(key: string, value: any) {
    setValues((v) => ({ ...v, [key]: value }));
  }
  function get(key: string, dflt: any = '') {
    return values[key] ?? dflt;
  }

  const dirty = initial ? JSON.stringify(initial) !== JSON.stringify(values) : false;

  async function save() {
    setSaving(true); setMsg(null);
    try {
      const diff: Vals = {};
      for (const k of Object.keys(values)) {
        if (JSON.stringify(values[k]) !== JSON.stringify(initial?.[k])) diff[k] = values[k];
      }
      await adminApi.settings.patch({ values: diff });
      setInitial(values);
      setMsg('Saved');
      setTimeout(() => setMsg(null), 2000);
    } catch (e: any) { setMsg(e.message); } finally { setSaving(false); }
  }

  function discard() { if (initial) setValues(initial); }

  if (!initial) return <div style={{ padding: 40, color: '#64748B' }}>Loading settings…</div>;

  return (
    <>
      <SessionTopbar fallbackName="Admin" fallbackInitial="A" fallbackRole="Super admin" />
      <Crumbs>Admin › Platform settings</Crumbs>
      <PageTitle>
        <div><H1>Platform settings</H1><Muted>Operational configuration. Changes are logged.</Muted></div>
      </PageTitle>

      <Content>
        <Card>
          <h3>General</h3>
          <div className="cs">Basic platform identity.</div>
          <Row><div><div className="l">Platform name</div><div className="h">Displayed in page titles and emails.</div></div><Field><Input value={get('general.platformName')} onChange={(e) => set('general.platformName', e.target.value)} /></Field></Row>
          <Row><div><div className="l">Support email</div></div><Field><Input value={get('general.supportEmail')} onChange={(e) => set('general.supportEmail', e.target.value)} /></Field></Row>
          <Row><div><div className="l">Primary language</div></div><Field><Select value={get('general.language')} onChange={(e) => set('general.language', e.target.value)}><option value="en-US">English (US)</option><option value="en-GB">English (UK)</option><option value="fr">FranÃ§ais</option></Select></Field></Row>
          <Row><div><div className="l">Timezone</div></div><Field><Select value={get('general.timezone')} onChange={(e) => set('general.timezone', e.target.value)}><option value="UTC">UTC</option><option value="Africa/Kampala">Africa/Kampala</option><option value="America/New_York">America/New_York</option></Select></Field></Row>
        </Card>

        <Card>
          <h3>Submissions &amp; verification</h3>
          <div className="cs">How organizations and causes move through review.</div>
          <Row>
            <div><div className="l">Auto-assign reviewers</div><div className="h">Route new submissions to the lightest-load reviewer.</div></div>
            <TogRow><span onClick={() => set('submissions.autoAssignReviewers', !get('submissions.autoAssignReviewers', true))}><Toggle $on={!!get('submissions.autoAssignReviewers', true)} /></span><span>{get('submissions.autoAssignReviewers', true) ? 'Enabled' : 'Disabled'}</span></TogRow>
          </Row>
          <Row>
            <div><div className="l">Submission SLA</div><div className="h">Overdue submissions are flagged in the queue.</div></div>
            <Field style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Input type="number" value={get('submissions.slaDays', 3)} onChange={(e) => set('submissions.slaDays', parseInt(e.target.value, 10) || 0)} style={{ width: 80 }} /><span style={{ fontSize: 13, color: '#64748B' }}>days</span></Field>
          </Row>
          <Row>
            <div><div className="l">Draft expiry</div></div>
            <Field style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Input type="number" value={get('submissions.draftExpireDays', 90)} onChange={(e) => set('submissions.draftExpireDays', parseInt(e.target.value, 10) || 0)} style={{ width: 80 }} /><span style={{ fontSize: 13, color: '#64748B' }}>days</span></Field>
          </Row>
        </Card>

        <Card>
          <h3>Notifications</h3>
          <div className="cs">Which events send emails.</div>
          <Row>
            <div><div className="l">Representative notifications</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <TogRow><span onClick={() => set('notifications.rep.submissionReceived', !get('notifications.rep.submissionReceived', true))}><Toggle $on={!!get('notifications.rep.submissionReceived', true)} /></span><span>Submission received</span></TogRow>
              <TogRow><span onClick={() => set('notifications.rep.decision', !get('notifications.rep.decision', true))}><Toggle $on={!!get('notifications.rep.decision', true)} /></span><span>Decision</span></TogRow>
              <TogRow><span onClick={() => set('notifications.rep.newInquiry', !get('notifications.rep.newInquiry', true))}><Toggle $on={!!get('notifications.rep.newInquiry', true)} /></span><span>New inquiry</span></TogRow>
              <TogRow><span onClick={() => set('notifications.rep.weeklyDigest', !get('notifications.rep.weeklyDigest', false))}><Toggle $on={!!get('notifications.rep.weeklyDigest', false)} /></span><span>Weekly digest</span></TogRow>
            </div>
          </Row>
          <Row>
            <div><div className="l">Reviewer notifications</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <TogRow><span onClick={() => set('notifications.reviewer.newAssignment', !get('notifications.reviewer.newAssignment', true))}><Toggle $on={!!get('notifications.reviewer.newAssignment', true)} /></span><span>New assignment</span></TogRow>
              <TogRow><span onClick={() => set('notifications.reviewer.dailySummary', !get('notifications.reviewer.dailySummary', true))}><Toggle $on={!!get('notifications.reviewer.dailySummary', true)} /></span><span>Daily queue summary</span></TogRow>
            </div>
          </Row>
        </Card>

        <Card>
          <h3>Privacy &amp; data</h3>
          <Row>
            <div><div className="l">Private-document retention</div></div>
            <Field style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Input type="number" value={get('privacy.documentRetentionDays', 365)} onChange={(e) => set('privacy.documentRetentionDays', parseInt(e.target.value, 10) || 0)} style={{ width: 100 }} /><span style={{ fontSize: 13, color: '#64748B' }}>days after archival</span></Field>
          </Row>
          <Row>
            <div><div className="l">Beneficiary privacy enforcement</div></div>
            <TogRow><span onClick={() => set('privacy.enforceBeneficiaryPrivacy', !get('privacy.enforceBeneficiaryPrivacy', true))}><Toggle $on={!!get('privacy.enforceBeneficiaryPrivacy', true)} /></span><span>{get('privacy.enforceBeneficiaryPrivacy', true) ? 'Required' : 'Off'}</span></TogRow>
          </Row>
        </Card>

        <SaveBar>
          <div className="msg">
            {msg ? <b>{msg}</b> : dirty ? <><b>Unsaved changes</b></> : 'All changes saved'}
          </div>
          <div className="acts">
            <Button $variant="ghost" $size="md" onClick={discard} disabled={!dirty || saving}>Discard</Button>
            <Button $variant="primary" $size="md" onClick={save} disabled={!dirty || saving}>Save changes</Button>
          </div>
        </SaveBar>
      </Content>
    </>
  );
}
