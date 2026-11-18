'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import styled from 'styled-components';
import { MapPin, Check, Building2, Calendar, Mail, Globe, MessageSquare, Share2, Info } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Pill } from '@/components/ui/Pill';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select, Textarea } from '@/components/ui/Form';
import { CATEGORY_LABEL } from '@/lib/mock-data';
import { publicApi, type PublicOrganization, type PublicCause, type PublicUpdate } from '@/lib/public-api';

const Cover = styled.div<{ $gradient: string }>`
  height: 260px;
  background: ${({ $gradient }) => $gradient};
  position: relative;
  overflow: hidden;
`;
const CoverWrap = styled.div` position: relative; height: 100%; `;
const Crumbs = styled.div`
  position: absolute;
  top: 28px;
  left: 32px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  a { color: rgba(255, 255, 255, 0.65); }
  strong { color: #fff; font-weight: 500; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { left: 20px; font-size: 12px; }
`;
const HeadWrap = styled(Container)` margin-top: -80px; position: relative; z-index: 2; `;
const HeadCard = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 28px 32px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 28px;
  align-items: center;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: auto 1fr; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; text-align: center; padding: 22px; }
`;
const Logo = styled.div<{ $gradient: string }>`
  width: 104px;
  height: 104px;
  border-radius: 18px;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 40px;
  font-family: ${({ theme }) => theme.fonts.serif};
  background: ${({ $gradient }) => $gradient};
  border: 4px solid #fff;
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin: 0 auto;
`;
const HeadInfo = styled.div`
  h1 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 32px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 6px; letter-spacing: -0.015em; }
  .loc { display: flex; gap: 14px; flex-wrap: wrap; color: ${({ theme }) => theme.colors.muted}; font-size: 14px; }
  .loc span { display: inline-flex; align-items: center; gap: 6px; }
  .pills { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
`;
const HeadActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { flex-direction: row; grid-column: 1 / -1; }
`;
const Body = styled.section` padding: 40px 0 64px; `;
const Layout = styled(Container)`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 40px;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Content = styled.div`
  h2 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 24px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin: 32px 0 12px; letter-spacing: -0.01em; }
  h2:first-of-type { margin-top: 0; }
  p { font-size: 15px; margin: 0 0 10px; line-height: 1.65; }
`;
const CGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 8px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; }
`;
const CC = styled(Link)`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; transform: translateY(-2px); }
  .im { height: 140px; position: relative; }
  .cat { position: absolute; top: 10px; left: 10px; background: rgba(255,255,255,.95); padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; color: ${({ theme }) => theme.colors.primary800}; text-transform: uppercase; letter-spacing: 0.04em; }
  .bd { padding: 16px; }
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 16px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 6px; line-height: 1.3; }
  .d { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; margin: 0 0 10px; }
  .mt { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid ${({ theme }) => theme.colors.border}; font-size: 12px; color: ${({ theme }) => theme.colors.muted}; }
  .ver { color: ${({ theme }) => theme.colors.success}; font-weight: 600; display: inline-flex; align-items: center; gap: 3px; }
`;
const Timeline = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
  &::before { content: ''; position: absolute; left: 14px; top: 12px; bottom: 12px; width: 2px; background: ${({ theme }) => theme.colors.border}; }
  li { position: relative; padding: 12px 0 16px 48px; &::before { content: ''; position: absolute; left: 8px; top: 16px; width: 14px; height: 14px; border-radius: 999px; background: ${({ theme }) => theme.colors.primary}; border: 3px solid #fff; box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}; } }
  .d { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; margin-bottom: 4px; }
  h4 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 16px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 4px; font-weight: 600; }
  p { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; margin: 0; }
`;
const Card = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 22px;
  margin-bottom: 18px;
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 17px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 12px; font-weight: 600; }
`;
const Kv = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  font-size: 13px;
  padding: 9px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-of-type { border-bottom: none; }
  .k { color: ${({ theme }) => theme.colors.muted}; }
  .v { color: ${({ theme }) => theme.colors.ink}; font-weight: 500; text-align: right; }
`;
const Contact = styled.div`
  a { display: flex; align-items: center; gap: 8px; padding: 9px 0; font-size: 13px; color: ${({ theme }) => theme.colors.ink}; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; text-decoration: none; }
  a:last-child { border-bottom: none; }
  a svg { color: ${({ theme }) => theme.colors.muted}; }
`;
const Notice = styled.div`
  background: ${({ theme }) => theme.colors.primary50};
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  color: ${({ theme }) => theme.colors.primary800};
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.55;
  display: flex;
  gap: 10px;
  svg { color: ${({ theme }) => theme.colors.primary}; flex-shrink: 0; margin-top: 2px; }
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

function formatYear(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.max(0, Math.round(ms / 86400e3));
  if (d < 1) return 'today';
  if (d < 14) return `${d} day${d === 1 ? '' : 's'} ago`;
  const w = Math.round(d / 7);
  if (w < 8) return `${w} week${w === 1 ? '' : 's'} ago`;
  const m = Math.round(d / 30);
  return `${m} month${m === 1 ? '' : 's'} ago`;
}

export default function OrgProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'ready'; organization: PublicOrganization; causes: PublicCause[]; updates: PublicUpdate[] }
    | { kind: 'notFound' }
    | { kind: 'error'; message: string }
  >({ kind: 'loading' });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', type: 'info', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | 'ok' | string>(null);

  useEffect(() => {
    if (!slug) return;
    publicApi
      .organization(slug)
      .then((data) => setState({ kind: 'ready', ...data }))
      .catch((err: Error) => {
        if (/not found/i.test(err.message)) setState({ kind: 'notFound' });
        else setState({ kind: 'error', message: err.message });
      });
  }, [slug]);

  if (state.kind === 'notFound') notFound();
  if (state.kind === 'loading') return <div style={{ padding: 60, textAlign: 'center', color: '#64748B' }}>Loading organization…</div>;
  if (state.kind === 'error') return <div style={{ padding: 60, textAlign: 'center', color: '#B91C1C' }}>{state.message}</div>;

  const { organization: org, causes, updates } = state;
  const categoryLabel = (CATEGORY_LABEL as any)[org.category] || org.category;

  async function submitInquiry(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setSent(null);
    try {
      await publicApi.submitInquiry({
        name: form.name,
        email: form.email,
        type: form.type,
        message: form.message,
        scope: 'organization',
        organizationSlug: org.slug,
      });
      setSent('ok');
      setForm({ name: '', email: '', type: 'info', message: '' });
    } catch (err: any) {
      setSent(err?.message || 'Could not send inquiry.');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Cover $gradient={org.gradient}>
        <Container>
          <CoverWrap>
            <Crumbs>
              <Link href="/">Home</Link> › <Link href="/organizations">Organizations</Link> ›{' '}
              <strong>{org.name}</strong>
            </Crumbs>
          </CoverWrap>
        </Container>
      </Cover>

      <HeadWrap>
        <HeadCard>
          <Logo $gradient={org.gradient}>{org.initial}</Logo>
          <HeadInfo>
            <h1>{org.name}</h1>
            <div className="loc">
              <span><MapPin size={14} />{org.location}</span>
              <span><Building2 size={14} />Humanitarian NGO</span>
              <span><Calendar size={14} />On the platform · {formatYear(org.createdAt)}</span>
            </div>
            <div className="pills">
              <Pill $tone="primary" style={{ textTransform: 'uppercase' }}>{categoryLabel}</Pill>
              {org.verified && (
                <Pill $tone="success">
                  <Check size={11} strokeWidth={3} />
                  Verified organization
                </Pill>
              )}
            </div>
          </HeadInfo>
          <HeadActions>
            <Button $variant="primary" $size="md" onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Hide form' : 'Send an inquiry'}
            </Button>
            <Button $variant="ghost" $size="md" onClick={() => navigator.share?.({ url: location.href, title: org.name }).catch(() => {})}>
              <Share2 size={14} />Share
            </Button>
          </HeadActions>
        </HeadCard>
      </HeadWrap>

      <Body>
        <Layout>
          <Content>
            <h2>About {org.name}</h2>
            <p>{org.longDescription || org.description}</p>
            {org.operatingSince && (
              <p>Operating since {org.operatingSince}. Verified on Meeting Global Needs in {formatYear(org.verifiedAt)}.</p>
            )}

            <h2>Published causes</h2>
            {causes.length > 0 ? (
              <CGrid>
                {causes.map((c) => (
                  <CC href={`/causes/${c.slug}`} key={c.id}>
                    <div className="im" style={{ background: c.gradient }}>
                      <span className="cat">{(CATEGORY_LABEL as any)[c.category] || c.category}</span>
                    </div>
                    <div className="bd">
                      <h3>{c.title}</h3>
                      <p className="d">{c.shortDescription}</p>
                      <div className="mt">
                        <span>Updated {relativeTime(c.lastUpdatedAt)}</span>
                        <span className="ver"><Check size={11} strokeWidth={3} />Verified</span>
                      </div>
                    </div>
                  </CC>
                ))}
              </CGrid>
            ) : (
              <p style={{ color: '#64748B', fontSize: 14 }}>
                No published causes yet. This organization has been verified but has not yet published a cause.
              </p>
            )}

            {updates.length > 0 && (
              <>
                <h2>Recent progress updates</h2>
                <Timeline>
                  {updates.map((u) => (
                    <li key={u.id}>
                      <div className="d">{relativeTime(u.approvedAt)} · Approved</div>
                      <h4>{u.title}</h4>
                      <p>{u.body}</p>
                    </li>
                  ))}
                </Timeline>
              </>
            )}
          </Content>

          <aside>
            {showForm && (
              <Card as="form" onSubmit={submitInquiry}>
                <h3>Send an inquiry</h3>
                {sent === 'ok' && <Banner $tone="success">Thanks — your inquiry has been sent.</Banner>}
                {sent && sent !== 'ok' && <Banner $tone="error">{sent}</Banner>}
                <Field><Label>Your name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                <Field><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
                <Field>
                  <Label>Inquiry type</Label>
                  <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="info">Request more information</option>
                    <option value="volunteer">Offer to volunteer</option>
                    <option value="partnership">Partnership opportunity</option>
                    <option value="support">General support</option>
                  </Select>
                </Field>
                <Field><Label>Message</Label><Textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
                <Button type="submit" $variant="primary" $size="md" $block disabled={sending}>
                  {sending ? 'Sending…' : 'Send inquiry'}
                </Button>
              </Card>
            )}
            <Card>
              <h3>Organization details</h3>
              <Kv><span className="k">Organization type</span><span className="v">Humanitarian NGO</span></Kv>
              <Kv><span className="k">Primary category</span><span className="v">{categoryLabel}</span></Kv>
              <Kv><span className="k">Primary location</span><span className="v">{org.location}</span></Kv>
              <Kv><span className="k">Published causes</span><span className="v">{causes.length}</span></Kv>
              <Kv><span className="k">Verification</span><span className="v" style={{ color: '#15803D' }}>{org.checksPassed} of {org.checksTotal} passed</span></Kv>
            </Card>
            <Card>
              <h3>Public contact</h3>
              <Contact>
                {org.publicEmail && <a href={`mailto:${org.publicEmail}`}><Mail size={14} />{org.publicEmail}</a>}
                <a href="#" onClick={(e) => { e.preventDefault(); setShowForm(true); }}><MessageSquare size={14} />Send an inquiry via the platform</a>
                {org.website && <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`} target="_blank" rel="noreferrer"><Globe size={14} />{org.website}</a>}
              </Contact>
            </Card>
            <Card>
              <Notice>
                <Info size={16} />
                <div>
                  <strong>About verification.</strong> Private verification records are not displayed
                  here. Reviewers inspected documentation before this organization was approved to publish.
                </div>
              </Notice>
            </Card>
          </aside>
        </Layout>
      </Body>
    </>
  );
}
