'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Check, Shield, Info, FileText } from 'lucide-react';
import { Container, Section } from '@/components/ui/Container';
import { H1, H2, Eyebrow, Lead } from '@/components/ui/Typography';
import { CATEGORIES, CATEGORY_LABEL } from '@/lib/mock-data';
import { publicApi, type PublicUpdate } from '@/lib/public-api';

const Head = styled.section`
  padding: 48px 0 32px;
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.primary50}, transparent);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  .top { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; align-items: center; @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; } }
  .pic { position: relative; height: 240px; border-radius: 16px; overflow: hidden; background: url('/landing/diverse.jpg') center/cover no-repeat; box-shadow: ${({ theme }) => theme.shadows.sm}; }
  .pic::after { content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(15,118,110,0) 50%, rgba(11,31,42,.55) 100%); }
  .pic .tag { position:absolute; left:16px; bottom:14px; z-index:1; color:#fff; font-family: ${({ theme }) => theme.fonts.serif}; font-size: 17px; font-weight: 600; max-width: 80%; line-height: 1.3; }
`;
const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 36px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
`;
const M = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 22px;
  .n { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 36px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; letter-spacing: -0.01em; line-height: 1; }
  .l { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; margin-top: 8px; font-weight: 500; }
  .i { font-size: 11px; color: ${({ theme }) => theme.colors.muted2}; margin-top: 4px; font-style: italic; }
`;
const Filters = styled.div` display: flex; gap: 8px; flex-wrap: wrap; margin: 28px 0 24px; `;
const F = styled.button<{ $active?: boolean }>`
  padding: 7px 14px;
  border-radius: 999px;
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : '#fff')};
  color: ${({ $active }) => ($active ? '#fff' : '#1E293B')};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
`;
const Feed = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Uc = styled.article`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  .hd { display: flex; gap: 12px; align-items: center; }
  .org { width: 40px; height: 40px; border-radius: 9px; color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 14px; font-family: ${({ theme }) => theme.fonts.serif}; flex-shrink: 0; }
  .n { font-weight: 700; color: ${({ theme }) => theme.colors.ink}; font-size: 14px; }
  .m { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; }
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 19px; color: ${({ theme }) => theme.colors.ink}; margin: 0; line-height: 1.3; font-weight: 600; }
  .img { height: 180px; border-radius: 10px; background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary100}, ${({ theme }) => theme.colors.accent50}); }
  p { margin: 0; font-size: 14px; color: ${({ theme }) => theme.colors.text}; line-height: 1.55; }
  .ft { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid ${({ theme }) => theme.colors.border}; font-size: 12px; color: ${({ theme }) => theme.colors.muted}; }
  .cat { background: ${({ theme }) => theme.colors.primary50}; color: ${({ theme }) => theme.colors.primary800}; padding: 3px 8px; border-radius: 999px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
  .ver { color: ${({ theme }) => theme.colors.success}; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
`;
const Milestones = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  .ms { display: flex; gap: 14px; padding: 14px; background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 12px;
    .ic { width: 36px; height: 36px; border-radius: 8px; background: ${({ theme }) => theme.colors.success50}; color: ${({ theme }) => theme.colors.success}; display: grid; place-items: center; flex-shrink: 0; }
    h4 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 15px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 4px; font-weight: 600; }
    p { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; margin: 0; }
  }
`;
const Note = styled.div`
  background: ${({ theme }) => theme.colors.primary50};
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  color: ${({ theme }) => theme.colors.primary800};
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.55;
  margin-top: 36px;
  display: flex;
  gap: 10px;
  svg { color: ${({ theme }) => theme.colors.primary}; flex-shrink: 0; margin-top: 2px; }
`;

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.max(1, Math.round(ms / 3600e3));
  if (h < 48) return `${h}h ago`;
  const d = Math.round(ms / 86400e3);
  if (d < 14) return `${d}d ago`;
  const w = Math.round(d / 7);
  if (w < 8) return `${w} week${w === 1 ? '' : 's'} ago`;
  return `${Math.round(d / 30)} month${Math.round(d / 30) === 1 ? '' : 's'} ago`;
}

export default function ImpactPage() {
  const [active, setActive] = useState<string>('all');
  const [updates, setUpdates] = useState<PublicUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ publishedCauses: number; approvedUpdates: number; categories: number; verifiedOrgs: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    publicApi
      .listUpdates({ category: active, limit: 24 })
      .then((data) => {
        if (cancelled) return;
        setUpdates(data.items);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [active]);

  useEffect(() => {
    publicApi.stats().then(setStats).catch(() => {});
  }, []);

  const gradients = ['linear-gradient(135deg,#0F766E,#115E59)', 'linear-gradient(135deg,#C7D2FE,#A5B4FC)', 'linear-gradient(135deg,#FECACA,#FCA5A5)', 'linear-gradient(135deg,#BBF7D0,#86EFAC)'];
  const catImg: Record<string, string> = {
    orphanages: '/landing/2.jpg',
    'foster-care': '/landing/children-learning.jpg',
    cancer: '/landing/healthcare.jpg',
    diabetes: '/landing/clinic.jpg',
    'mental-health': '/landing/3.jpg',
    veterans: '/landing/1.jpg',
    other: '/landing/community-group.jpg',
  };

  return (
    <>
      <Head>
        <Container>
          <div className="top">
            <div>
              <Eyebrow>Impact &amp; transparency</Eyebrow>
              <H1 style={{ marginTop: 10, marginBottom: 12 }}>Real progress, reviewed before it's shared</H1>
              <Lead>
                Every update you see here was submitted by an approved organization and inspected by an
                independent reviewer. We don't publish fabricated outcomes.
              </Lead>
            </div>
            <div className="pic"><div className="tag">Community programs across 12 regions, every update reviewer-approved.</div></div>
          </div>
          <Metrics>
            <M><div className="n">{stats?.publishedCauses ?? 0}</div><div className="l">Published causes</div></M>
            <M><div className="n">{stats?.approvedUpdates ?? 0}</div><div className="l">Approved updates</div></M>
            <M><div className="n">{stats?.categories ?? CATEGORIES.length}</div><div className="l">Humanitarian categories</div></M>
            <M><div className="n">100%</div><div className="l">Reviewed before publishing</div></M>
          </Metrics>
        </Container>
      </Head>

      <Section $bg="bg">
        <Container>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20, marginBottom: 12 }}>
            <div>
              <H2>Latest approved updates</H2>
              <div style={{ fontSize: 14, color: '#64748B', marginTop: 6 }}>
                Submitted by organizations, approved by reviewers, published on the public site.
              </div>
            </div>
          </div>
          <Filters>
            <F $active={active === 'all'} onClick={() => setActive('all')}>All updates</F>
            {CATEGORIES.map((c) => (
              <F key={c.slug} $active={active === c.slug} onClick={() => setActive(c.slug)}>{c.name}</F>
            ))}
          </Filters>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading updates…</div>
          ) : updates.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
              No approved updates in this category yet.
            </div>
          ) : (
            <Feed>
              {updates.map((u, i) => {
                const label = u.cause ? (CATEGORY_LABEL as any)[u.cause.category] || u.cause.category : 'Update';
                const gradient = u.cause?.gradient || gradients[i % gradients.length];
                return (
                  <Uc key={u.id}>
                    <div className="hd">
                      <div className="org" style={{ background: u.organization?.gradient || gradient }}>{u.organization?.initial || '?'}</div>
                      <div>
                        <div className="n">{u.organization?.name || 'Organization'}</div>
                        <div className="m">{label}{u.organization?.location ? ` · ${u.organization.location}` : ''}</div>
                      </div>
                    </div>
                    <h3>{u.title}</h3>
                    <div
                      className="img"
                      style={u.cause?.category && catImg[u.cause.category]
                        ? { backgroundImage: `url(${catImg[u.cause.category]})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : { background: gradient }}
                    />
                    <p>{u.body}</p>
                    <div className="ft">
                      <span className="cat">{label}</span>
                      <span className="ver"><Check size={12} strokeWidth={3} />Approved {relativeTime(u.approvedAt)}</span>
                    </div>
                  </Uc>
                );
              })}
            </Feed>
          )}

          <div style={{ marginTop: 56 }}>
            <H2>Recent milestones</H2>
            <div style={{ fontSize: 14, color: '#64748B', marginTop: 6 }}>Operational milestones recorded in the platform.</div>
            <Milestones>
              <div className="ms"><div className="ic"><Shield size={18} /></div><div><h4>{stats?.verifiedOrgs ?? 0} verified organizations</h4><p>Approved to submit causes and progress updates</p></div></div>
              <div className="ms"><div className="ic"><Check size={18} /></div><div><h4>{stats?.approvedUpdates ?? 0} approved updates</h4><p>Across all approved organizations</p></div></div>
              <div className="ms"><div className="ic"><FileText size={18} /></div><div><h4>Reviewer capacity</h4><p>Reviewers continually inspect submissions before publication</p></div></div>
            </Milestones>
          </div>

          <Note>
            <Info size={18} />
            <div><strong>What we don't publish.</strong> We do not display donation totals, money raised, or beneficiary counts that we cannot verify from our own records. Organizations' reported outcomes always appear with clear attribution to the organization.</div>
          </Note>
        </Container>
      </Section>
    </>
  );
}
