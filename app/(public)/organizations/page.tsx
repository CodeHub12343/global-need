'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { MapPin, Check, Shield, Building2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { H1, Lead, Eyebrow } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { CATEGORY_LABEL } from '@/lib/mock-data';
import { publicApi, type PublicOrganization } from '@/lib/public-api';

const Head = styled.section`
  padding: 56px 0 36px;
  background:
    linear-gradient(90deg, #fff 0%, rgba(255,255,255,.96) 45%, rgba(255,255,255,.65) 70%, rgba(255,255,255,.35) 100%),
    url('/landing/community-group.jpg') right center/cover no-repeat;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 28px 0 24px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.94) 55%, rgba(255,255,255,0.88) 100%),
      linear-gradient(180deg, rgba(15,118,110,0.12), rgba(15,118,110,0.04)),
      url('/landing/community-group.jpg') center/cover no-repeat;
  }
`;
const Body = styled.section` padding: 40px 0 64px; `;
const VerifStrip = styled.div`
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.primary50}, transparent);
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  gap: 14px;
  svg { color: ${({ theme }) => theme.colors.primary}; flex-shrink: 0; }
  .t { font-weight: 700; color: ${({ theme }) => theme.colors.ink}; font-size: 15px; }
  .s { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: repeat(2, 1fr); gap: 12px; }
`;
const OrgCard = styled(Link)`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-decoration: none;
  transition: all 0.15s;
  min-width: 0;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; transform: translateY(-2px); }
  .head { display: flex; align-items: center; gap: 14px; min-width: 0; }
  .head > div { min-width: 0; }
  .lg { width: 54px; height: 54px; border-radius: 12px; color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 20px; font-family: ${({ theme }) => theme.fonts.serif}; flex-shrink: 0; }
  .n { font-weight: 700; color: ${({ theme }) => theme.colors.ink}; font-size: 16px; font-family: ${({ theme }) => theme.fonts.serif}; }
  .l { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; display: inline-flex; align-items: center; gap: 4px; margin-top: 3px; }
  .desc { font-size: 14px; color: ${({ theme }) => theme.colors.text}; line-height: 1.5; flex-grow: 1; }
  .foot { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid ${({ theme }) => theme.colors.border}; font-size: 12px; gap: 6px; }
  .ct { padding: 3px 8px; border-radius: 999px; background: ${({ theme }) => theme.colors.primary50}; color: ${({ theme }) => theme.colors.primary800}; font-weight: 600; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .vrf { color: ${({ theme }) => theme.colors.success}; font-weight: 600; display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 12px;
    gap: 10px;
    border-radius: 12px;
    .head { gap: 10px; }
    .lg { width: 40px; height: 40px; border-radius: 10px; font-size: 15px; }
    .n { font-size: 13.5px; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .l { font-size: 11px; margin-top: 2px; }
    .desc { font-size: 11.5px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .foot { padding-top: 8px; font-size: 10.5px; }
    .ct { font-size: 9.5px; padding: 2px 6px; }
    .vrf { font-size: 10.5px; svg { width: 10px; height: 10px; } }
  }
`;

export default function OrganizationsPage() {
  const [items, setItems] = useState<PublicOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    publicApi
      .listOrganizations({ limit: 48 })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <Head>
        <Container>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
            <Link href="/" style={{ color: '#64748B' }}>Home</Link> › <span>Organizations</span>
          </div>
          <Eyebrow>Directory</Eyebrow>
          <H1 style={{ marginTop: 10, marginBottom: 12 }}>Approved humanitarian organizations</H1>
          <Lead>
            Organizations here have been independently reviewed and are actively authorized to
            submit causes and progress updates on Meeting Global Needs.
          </Lead>
        </Container>
      </Head>
      <Body>
        <Container>
          <VerifStrip>
            <Shield size={24} />
            <div>
              <div className="t">What verification means on Meeting Global Needs</div>
              <div className="s">
                Reviewers inspect supporting documents privately. Personal and sensitive records are
                never displayed on public profiles.
              </div>
            </div>
          </VerifStrip>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading organizations…</div>
          ) : error ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#B91C1C' }}>{error}</div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Building2 size={26} />}
              title="Our founding partners are onboarding"
              body="Meeting Global Needs is verifying its first humanitarian organizations. Approved organizations will appear here once their review is complete. Run one yourself? Register now to be considered among the founding partners."
              primaryHref="/register?role=org"
              primaryLabel="Register your organization"
            />
          ) : (
            <Grid>
              {items.map((o) => (
                <OrgCard key={o.id} href={`/organizations/${o.slug}`}>
                  <div className="head">
                    <div className="lg" style={{ background: o.gradient }}>{o.initial}</div>
                    <div>
                      <div className="n">{o.name}</div>
                      <div className="l"><MapPin size={11} />{o.location}</div>
                    </div>
                  </div>
                  <div className="desc">{o.description}</div>
                  <div className="foot">
                    <span className="ct">{(CATEGORY_LABEL as any)[o.category] || o.category}</span>
                    {o.verified && (
                      <span className="vrf">
                        <Check size={11} strokeWidth={3} />Verified
                      </span>
                    )}
                  </div>
                </OrgCard>
              ))}
            </Grid>
          )}
        </Container>
      </Body>
    </>
  );
}
