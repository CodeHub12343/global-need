'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Eye, Check, Info } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Button, LinkButton } from '@/components/ui/Button';
import { Field, Label, Input, Select, Textarea, Hint } from '@/components/ui/Form';
import { Pill } from '@/components/ui/Pill';
import { CATEGORIES } from '@/lib/mock-data';
import { dashApi } from '@/lib/dashboard-api';

const VStrip = styled.div`
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary50}, ${({ theme }) => theme.colors.accent50});
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  svg { color: ${({ theme }) => theme.colors.primary}; flex-shrink: 0; }
  .t { font-weight: 700; color: ${({ theme }) => theme.colors.ink}; font-size: 14px; }
  .s { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
`;
const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Card = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 26px;
  margin-bottom: 16px;
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 17px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 4px; font-weight: 600; }
  .cs { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-bottom: 18px; }
`;
const Fg = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; }
`;
const LogoRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
  flex-wrap: wrap;
  .big { width: 80px; height: 80px; border-radius: 14px; color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 32px; font-family: ${({ theme }) => theme.fonts.serif}; flex-shrink: 0; }
  .lbl { font-size: 12px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin-bottom: 6px; }
  .hint { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 6px; }
`;
const Preview = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 18px;
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 15px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 10px; font-weight: 600; }
  .pbox { border: 1px dashed ${({ theme }) => theme.colors.border}; border-radius: 10px; overflow: hidden; }
  .pcover { height: 70px; }
  .pbody { padding: 14px; margin-top: -30px; position: relative; }
  .plogo { width: 50px; height: 50px; border-radius: 10px; color: #fff; display: grid; place-items: center; font-weight: 700; font-family: ${({ theme }) => theme.fonts.serif}; border: 3px solid #fff; }
  .pname { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 15px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin-top: 8px; }
  .ploc { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 3px; }
`;
const Verf = styled.div`
  background: ${({ theme }) => theme.colors.warning50};
  border: 1px solid #fbbf24;
  border-radius: 12px;
  padding: 16px;
  margin-top: 14px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.warning};
  line-height: 1.5;
  display: flex;
  gap: 10px;
  svg { flex-shrink: 0; margin-top: 2px; }
`;
const Banner = styled.div<{ $tone: 'success' | 'error' }>`
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 16px;
  background: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success50 : theme.colors.error50)};
  color: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
  border: 1px solid ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
`;

export default function OrgProfileEditorPage() {
  const [org, setOrg] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [verifier, setVerifier] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ t: 'success' | 'error'; m: string } | null>(null);

  useEffect(() => {
    dashApi.organization.get().then((d) => {
      setOrg(d.organization);
      setVerifier(d.verifiedBy);
      setForm({
        name: d.organization.name,
        shortDescription: d.organization.description,
        description: d.organization.longDescription,
        category: d.organization.category,
        country: d.organization.country,
        city: d.organization.city,
        operatingSince: d.organization.operatingSince,
        publicEmail: d.organization.publicEmail,
        publicPhone: d.organization.publicPhone,
        website: d.organization.website,
        gradient: d.organization.gradient,
      });
    });
  }, []);

  function p(k: string, v: string) { setForm((f: any) => ({ ...f, [k]: v })); }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const data = await dashApi.organization.patch(form);
      setOrg(data.organization);
      setMsg({
        t: 'success',
        m: data.triggersReview
          ? `Saved. Changed fields (${data.changedFields.join(', ')}) may trigger reviewer re-approval.`
          : `Saved ${data.changedFields.length} change${data.changedFields.length === 1 ? '' : 's'}.`,
      });
    } catch (err: any) {
      setMsg({ t: 'error', m: err.message });
    } finally {
      setSaving(false);
    }
  }

  const verified = org?.verified;
  const previewGrad = form.gradient || org?.gradient || 'linear-gradient(135deg,#0F766E,#115E59)';
  const initial = (form.name || org?.name || '?').trim().charAt(0).toUpperCase();

  return (
    <>
      <SessionTopbar fallbackName="Organization" fallbackInitial="O" fallbackRole="Organization" showOrgInsteadOfRole />
      <Crumbs>Dashboard › Organization profile</Crumbs>
      <PageTitle>
        <div>
          <H1>Organization profile</H1>
          <Muted>
            Edit the public-facing information for {org?.name || 'your organization'}. Changes to approved fields may trigger reviewer re-approval.
          </Muted>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {org?.slug && (
            <LinkButton as={Link} href={`/organizations/${org.slug}`} $variant="ghost" $size="md" target="_blank">
              <Eye size={13} />View public page
            </LinkButton>
          )}
          <Button $variant="primary" $size="md" onClick={save} disabled={saving || !org}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </PageTitle>

      {verified ? (
        <VStrip>
          <Check size={22} />
          <div style={{ flexGrow: 1 }}>
            <div className="t">Organization verified</div>
            <div className="s">Verified {org.verifiedAt ? new Date(org.verifiedAt).toLocaleDateString() : ''}{verifier ? ` by ${verifier.name}` : ''}</div>
          </div>
          <Pill $tone="success"><Check size={11} strokeWidth={3} />Verified</Pill>
        </VStrip>
      ) : org ? (
        <VStrip>
          <Info size={22} />
          <div style={{ flexGrow: 1 }}>
            <div className="t">Organization under review</div>
            <div className="s">A reviewer will inspect your documents and verify your organization.</div>
          </div>
          <Pill $tone="warning">Pending</Pill>
        </VStrip>
      ) : null}

      {msg && <Banner $tone={msg.t}>{msg.m}</Banner>}

      <Layout>
        <div>
          <Card>
            <h3>Public profile</h3>
            <div className="cs">Shown on your organization's public page.</div>
            <LogoRow>
              <div className="big" style={{ background: previewGrad }}>{initial}</div>
              <div>
                <div className="lbl">Organization logo</div>
                <div className="hint">Logo uploads are set up in a later phase — the header color follows your gradient below.</div>
              </div>
            </LogoRow>
            <Fg>
              <Field><Label>Organization name</Label><Input value={form.name || ''} onChange={(e) => p('name', e.target.value)} /></Field>
              <Field>
                <Label>Primary category</Label>
                <Select value={form.category || ''} onChange={(e) => p('category', e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </Select>
              </Field>
            </Fg>
            <Field>
              <Label>Short description</Label>
              <Textarea rows={2} value={form.shortDescription || ''} onChange={(e) => p('shortDescription', e.target.value)} />
              <Hint>Shown on listing cards and search results.</Hint>
            </Field>
            <Field>
              <Label>Full description</Label>
              <Textarea rows={5} value={form.description || ''} onChange={(e) => p('description', e.target.value)} />
            </Field>
            <Fg>
              <Field><Label>Operating since</Label><Input value={form.operatingSince || ''} onChange={(e) => p('operatingSince', e.target.value)} /></Field>
              <Field><Label>Country</Label><Input value={form.country || ''} onChange={(e) => p('country', e.target.value)} /></Field>
              <Field><Label>City or region</Label><Input value={form.city || ''} onChange={(e) => p('city', e.target.value)} /></Field>
              <Field>
                <Label>Brand gradient</Label>
                <Input value={form.gradient || ''} onChange={(e) => p('gradient', e.target.value)} placeholder="linear-gradient(135deg,#0F766E,#115E59)" />
              </Field>
            </Fg>
          </Card>

          <Card>
            <h3>Public contact</h3>
            <div className="cs">Shown with your organization profile. Keep this to a channel you monitor.</div>
            <Fg>
              <Field><Label>Email</Label><Input type="email" value={form.publicEmail || ''} onChange={(e) => p('publicEmail', e.target.value)} /></Field>
              <Field><Label>Website (optional)</Label><Input value={form.website || ''} onChange={(e) => p('website', e.target.value)} /></Field>
            </Fg>
            <Field><Label>Public phone (optional)</Label><Input value={form.publicPhone || ''} onChange={(e) => p('publicPhone', e.target.value)} /></Field>
          </Card>
        </div>

        <aside>
          <Preview>
            <h3>Public page preview</h3>
            <div className="pbox">
              <div className="pcover" style={{ background: previewGrad }} />
              <div className="pbody">
                <div className="plogo" style={{ background: previewGrad }}>{initial}</div>
                <div className="pname">{form.name || 'Your organization'}</div>
                <div className="ploc">{form.city}{form.city && form.country ? ', ' : ''}{form.country}</div>
                <div style={{ marginTop: 10 }}>
                  {verified
                    ? <Pill $tone="success"><Check size={10} strokeWidth={3} />Verified</Pill>
                    : <Pill $tone="warning">Pending</Pill>}
                </div>
              </div>
            </div>
            {org?.slug && (
              <Link href={`/organizations/${org.slug}`} target="_blank" style={{ display: 'inline-block', marginTop: 14, fontSize: 13, fontWeight: 600, color: '#115E59' }}>
                Open full preview ›
              </Link>
            )}
          </Preview>

          <Verf>
            <Info size={18} />
            <div>
              <strong>Changes trigger review.</strong> Editing name, category or description queues your profile for reviewer re-approval. The public page keeps showing the approved version until the change is cleared.
            </div>
          </Verf>
        </aside>
      </Layout>
    </>
  );
}
