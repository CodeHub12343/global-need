'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import { MapPin, Clock, Check, Calendar, Info, Share2, Bookmark } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Pill } from '@/components/ui/Pill';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select, Textarea } from '@/components/ui/Form';
import { CATEGORY_LABEL } from '@/lib/mock-data';
import { publicApi, type PublicCause, type PublicUpdate } from '@/lib/public-api';

const Hero = styled.section`
  background: #fff;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 32px 0 48px;
`;
const Crumbs = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 16px;
  a { color: ${({ theme }) => theme.colors.muted}; }
`;
const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  letter-spacing: -0.02em;
  margin: 14px 0;
  line-height: 1.15;
`;
const Meta = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 14px;
  span { display: inline-flex; align-items: center; gap: 6px; }
`;
const Media = styled.div<{ $gradient: string }>`
  position: relative;
  height: 420px;
  border-radius: 16px;
  overflow: hidden;
  margin-top: 28px;
  background: ${({ $gradient }) => $gradient};
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { height: 240px; }
`;
const Body = styled.section` padding: 48px 0 64px; `;
const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 40px;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Prose = styled.div`
  h2 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 26px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin: 32px 0 12px; &:first-child { margin-top: 0; } }
  p { font-size: 16px; margin: 0 0 12px; line-height: 1.65; }
`;
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin: 20px 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; }
`;
const InfoItem = styled.div`
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  .l { font-size: 12px; font-weight: 700; color: ${({ theme }) => theme.colors.muted}; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px; }
  .v { font-size: 15px; color: ${({ theme }) => theme.colors.ink}; font-weight: 500; }
`;
const Timeline = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
  &::before { content: ''; position: absolute; left: 14px; top: 12px; bottom: 12px; width: 2px; background: ${({ theme }) => theme.colors.border}; }
  li { position: relative; padding: 14px 0 18px 48px; &::before { content: ''; position: absolute; left: 8px; top: 18px; width: 14px; height: 14px; border-radius: 999px; background: ${({ theme }) => theme.colors.primary}; border: 3px solid #fff; box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}; } }
  .d { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; margin-bottom: 4px; }
  h4 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 17px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 6px; }
  p { font-size: 14px; color: ${({ theme }) => theme.colors.muted}; margin: 0; }
`;
const Card = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 22px;
  margin-bottom: 20px;
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 18px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 14px; }
`;
const OrgHead = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  .lg { width: 48px; height: 48px; border-radius: 10px; background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primary800}); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 18px; font-family: ${({ theme }) => theme.fonts.serif}; }
  .n { font-weight: 700; color: ${({ theme }) => theme.colors.ink}; font-size: 15px; }
  .m { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; display: inline-flex; align-items: center; gap: 4px; }
`;
const Kv = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  font-size: 13px;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-of-type { border-bottom: none; }
  .k { color: ${({ theme }) => theme.colors.muted}; }
  .v { color: ${({ theme }) => theme.colors.ink}; font-weight: 500; text-align: right; }
`;
const Notice = styled.div`
  background: ${({ theme }) => theme.colors.primary50};
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  color: ${({ theme }) => theme.colors.primary800};
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 13px;
  display: flex;
  gap: 10px;
  margin: 20px 0;
  svg { color: ${({ theme }) => theme.colors.primary}; flex-shrink: 0; margin-top: 1px; }
`;
const ShareRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  button { flex: 1; padding: 8px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; border-radius: 8px; background: #fff; cursor: pointer; color: ${({ theme }) => theme.colors.muted}; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; font-family: inherit; }
`;
const Status = styled.div`
  padding: 40px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
`;
const Banner = styled.div<{ $tone: 'success' | 'error' }>`
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 12px;
  background: ${({ $tone, theme }) =>
    $tone === 'success' ? theme.colors.success50 : theme.colors.error50};
  color: ${({ $tone, theme }) =>
    $tone === 'success' ? theme.colors.success : theme.colors.error};
  border: 1px solid ${({ $tone, theme }) =>
    $tone === 'success' ? theme.colors.success : theme.colors.error};
`;

const INQUIRY_TYPES: { v: string; label: string }[] = [
  { v: 'info', label: 'Request more information' },
  { v: 'volunteer', label: 'Offer to volunteer' },
  { v: 'partnership', label: 'Partnership opportunity' },
  { v: 'support', label: 'General support' },
  { v: 'general', label: 'Other' },
];

function formatDate(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60e3);
  if (m < 60) return `${Math.max(1, m)} min ago`;
  const h = Math.round(ms / 3600e3);
  if (h < 48) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.round(ms / 86400e3);
  if (d < 14) return `${d} day${d === 1 ? '' : 's'} ago`;
  const w = Math.round(d / 7);
  if (w < 8) return `${w} week${w === 1 ? '' : 's'} ago`;
  return formatDate(iso);
}

export default function CauseDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'ready'; cause: PublicCause; updates: PublicUpdate[] }
    | { kind: 'notFound' }
    | { kind: 'error'; message: string }
  >({ kind: 'loading' });

  const [form, setForm] = useState({ name: '', email: '', type: 'info', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | 'ok' | string>(null);

  useEffect(() => {
    if (!slug) return;
    setState({ kind: 'loading' });
    publicApi
      .cause(slug)
      .then((data) => setState({ kind: 'ready', cause: data.cause, updates: data.updates }))
      .catch((err: Error) => {
        if (/not found/i.test(err.message)) setState({ kind: 'notFound' });
        else setState({ kind: 'error', message: err.message });
      });
  }, [slug]);

  if (state.kind === 'notFound') notFound();
  if (state.kind === 'loading') {
    return (
      <Container>
        <Status>Loading cause…</Status>
      </Container>
    );
  }
  if (state.kind === 'error') {
    return (
      <Container>
        <Status>Couldn't load this cause: {state.message}</Status>
      </Container>
    );
  }

  const { cause, updates } = state;
  const org = cause.organization;
  const categoryLabel = (CATEGORY_LABEL as any)[cause.category] || cause.category;

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
        scope: 'cause',
        causeSlug: cause.slug,
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
      <Hero>
        <Container>
          <Crumbs>
            <Link href="/">Home</Link> ›{' '}
            <Link href="/causes">Causes</Link> ›{' '}
            <span>{categoryLabel}</span> ›{' '}
            <span>{cause.title}</span>
          </Crumbs>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Pill $tone="primary" style={{ textTransform: 'uppercase' }}>{categoryLabel}</Pill>
            {org?.verified && (
              <Pill $tone="success">
                <Check size={11} strokeWidth={3} />
                Independently reviewed
              </Pill>
            )}
          </div>
          <Title>{cause.title}</Title>
          <Meta>
            {cause.location && <span><MapPin size={14} />{cause.location}</span>}
            {cause.lastUpdatedAt && <span><Clock size={14} />Last updated {relativeTime(cause.lastUpdatedAt)}</span>}
            {cause.publishedAt && <span><Calendar size={14} />Published {formatDate(cause.publishedAt)}</span>}
          </Meta>
          <Media $gradient={cause.gradient} aria-hidden="true" />
        </Container>
      </Hero>
      <Body>
        <Container>
          <Layout>
            <Prose>
              <h2>About this cause</h2>
              <p>{cause.story}</p>
              <h2>The humanitarian need</h2>
              <p>{cause.need}</p>
              <InfoGrid>
                <InfoItem><div className="l">Location</div><div className="v">{cause.location || '—'}</div></InfoItem>
                <InfoItem><div className="l">Category</div><div className="v">{categoryLabel}</div></InfoItem>
                <InfoItem><div className="l">Intended use</div><div className="v">{cause.intendedUse || '—'}</div></InfoItem>
                <InfoItem><div className="l">Published</div><div className="v">{formatDate(cause.publishedAt) || '—'}</div></InfoItem>
              </InfoGrid>

              {updates.length > 0 && (
                <>
                  <h2>Progress updates</h2>
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

              <Notice>
                <Info size={18} />
                <div>
                  <strong>Verification note.</strong> Supporting documents for this cause have been
                  reviewed privately. Identifiable personal details of beneficiaries are never
                  displayed publicly.
                </div>
              </Notice>
            </Prose>

            <aside>
              {org && (
                <Card>
                  <h3>Organization</h3>
                  <OrgHead>
                    <div className="lg">{org.initial}</div>
                    <div>
                      <div className="n">{org.name}</div>
                      {org.verified && (
                        <div className="m">
                          <Check size={11} strokeWidth={3} color="#15803D" />
                          <span style={{ color: '#15803D' }}>Verified organization</span>
                        </div>
                      )}
                    </div>
                  </OrgHead>
                  <Kv><span className="k">Primary location</span><span className="v">{org.location}</span></Kv>
                  <Kv><span className="k">Primary category</span><span className="v">{(CATEGORY_LABEL as any)[org.category] || org.category}</span></Kv>
                  <Kv><span className="k">Reviewer checks</span><span className="v">{org.checksPassed} of {org.checksTotal} passed</span></Kv>
                  <Link href={`/organizations/${org.slug}`} style={{ display: 'inline-block', marginTop: 14, fontWeight: 600, fontSize: 13, color: '#115E59' }}>
                    View organization profile ›
                  </Link>
                </Card>
              )}

              <Card as="form" onSubmit={submitInquiry}>
                <h3>Get in touch</h3>
                <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 14px' }}>
                  Send a cause-specific inquiry — the organization will see your message in their
                  dashboard and reply through the platform.
                </p>
                {sent === 'ok' && (
                  <Banner $tone="success">Thanks — your inquiry has been sent.</Banner>
                )}
                {sent && sent !== 'ok' && <Banner $tone="error">{sent}</Banner>}
                <Field><Label>Your name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" /></Field>
                <Field><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></Field>
                <Field>
                  <Label>Inquiry type</Label>
                  <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {INQUIRY_TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
                  </Select>
                </Field>
                <Field><Label>Message</Label><Textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Share a few details…" /></Field>
                <Button type="submit" $variant="primary" $size="md" $block disabled={sending}>
                  {sending ? 'Sending…' : 'Send inquiry'}
                </Button>
                <ShareRow>
                  <button type="button" onClick={() => navigator.share?.({ url: location.href, title: cause.title }).catch(() => {})}><Share2 size={14} />Share</button>
                  <button type="button"><Bookmark size={14} />Save</button>
                </ShareRow>
              </Card>
            </aside>
          </Layout>
        </Container>
      </Body>
    </>
  );
}
