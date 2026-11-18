'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import styled from 'styled-components';
import { Heart, MessageSquare, Compass, Settings, LogOut, Mail, Check, Clock, Search } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { H1, Lead, Eyebrow } from '@/components/ui/Typography';
import { LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

const Head = styled.section`
  padding: 48px 0 32px;
  background:
    linear-gradient(90deg, #fff 0%, rgba(255,255,255,.96) 45%, rgba(255,255,255,.7) 72%, rgba(255,255,255,.4) 100%),
    url('/landing/community-group.jpg') right center/cover no-repeat;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 28px 0 20px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.94) 55%, rgba(255,255,255,0.88) 100%),
      url('/landing/community-group.jpg') center/cover no-repeat;
  }
`;
const Body = styled.section` padding: 36px 0 72px; `;
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.8fr;
  gap: 24px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Side = styled.div` display: flex; flex-direction: column; gap: 18px; `;
const Card = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 22px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { padding: 18px; }
`;
const Profile = styled(Card)`
  .avrow { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .av {
    width: 54px; height: 54px; border-radius: 999px;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primary800});
    color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 20px;
    font-family: ${({ theme }) => theme.fonts.serif};
  }
  .n { font-weight: 700; font-size: 16px; color: ${({ theme }) => theme.colors.ink}; font-family: ${({ theme }) => theme.fonts.serif}; }
  .e { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; word-break: break-all; }
  .meta { display: flex; flex-direction: column; gap: 8px; padding-top: 14px; border-top: 1px solid ${({ theme }) => theme.colors.border}; font-size: 13px; color: ${({ theme }) => theme.colors.text}; }
  .meta .row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .meta .lbl { color: ${({ theme }) => theme.colors.muted}; }
  .vrf { display: inline-flex; align-items: center; gap: 4px; color: ${({ theme }) => theme.colors.success}; font-weight: 600; font-size: 12px; }
  .pnd { color: ${({ theme }) => theme.colors.warning}; font-weight: 600; font-size: 12px; }
`;
const NavCard = styled(Card)`
  padding: 10px;
  a, button {
    display: flex; align-items: center; gap: 10px; padding: 11px 12px;
    border-radius: 10px; text-decoration: none; color: ${({ theme }) => theme.colors.text};
    font-size: 14px; font-weight: 500; font-family: inherit;
    background: none; border: none; width: 100%; text-align: left; cursor: pointer;
    &:hover { background: ${({ theme }) => theme.colors.bg}; color: ${({ theme }) => theme.colors.primary700}; }
    svg { color: ${({ theme }) => theme.colors.muted}; }
    &:hover svg { color: ${({ theme }) => theme.colors.primary}; }
    &.danger { color: ${({ theme }) => theme.colors.error}; svg { color: ${({ theme }) => theme.colors.error}; } }
  }
`;
const Stat = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: repeat(3, 1fr); gap: 8px; }
`;
const StatBox = styled(Card)`
  padding: 16px 18px;
  .v { font-size: 22px; font-weight: 700; color: ${({ theme }) => theme.colors.ink}; font-family: ${({ theme }) => theme.fonts.serif}; line-height: 1; }
  .l { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-top: 6px; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 12px;
    .v { font-size: 18px; }
    .l { font-size: 11px; }
  }
`;
const Panel = styled(Card)` padding: 0; overflow: hidden; `;
const PanelHead = styled.div`
  padding: 20px 22px 14px;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;
  .t { font-size: 15px; font-weight: 700; color: ${({ theme }) => theme.colors.ink}; font-family: ${({ theme }) => theme.fonts.serif}; }
  .s { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; margin-top: 3px; }
`;
const InqList = styled.div`
  padding: 0 22px 18px;
  .r { display: flex; align-items: flex-start; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; &:last-child { border-bottom: none; } }
  .ic { width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; flex-shrink: 0; background: ${({ theme }) => theme.colors.primary50}; color: ${({ theme }) => theme.colors.primary700}; }
  .m { flex: 1; min-width: 0; }
  .sub { font-size: 14px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
  .meta { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-top: 3px; display: flex; gap: 10px; flex-wrap: wrap; }
  .st { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; letter-spacing: 0.02em; flex-shrink: 0; }
  .st.new, .st.waiting { background: #fef3c7; color: #92400e; }
  .st.resolved { background: #d1fae5; color: #065f46; }
  .st.flagged { background: #fee2e2; color: #991b1b; }
`;
const Explore = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; }
  .qb {
    padding: 18px; border-radius: 12px; text-decoration: none;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary50}, #fff);
    border: 1px solid ${({ theme }) => theme.colors.primary100};
    display: flex; gap: 14px; align-items: flex-start;
    &:hover { border-color: ${({ theme }) => theme.colors.primary}; transform: translateY(-1px); }
    .qi { width: 38px; height: 38px; border-radius: 10px; background: #fff; color: ${({ theme }) => theme.colors.primary700}; display: grid; place-items: center; flex-shrink: 0; }
    .qt { font-weight: 700; color: ${({ theme }) => theme.colors.ink}; font-size: 14px; }
    .qs { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-top: 3px; line-height: 1.5; }
  }
`;

function relativeDate(iso: string): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.round(ms / 86400e3);
  if (d < 1) return 'today';
  if (d < 2) return 'yesterday';
  if (d < 14) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/sign-in?callbackUrl=/account');
      return;
    }
    if (status !== 'authenticated') return;
    fetch('/api/account/overview')
      .then((r) => r.json())
      .then((d) => { setData(d.data || d); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <Body>
        <Container><div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Checking your session…</div></Container>
      </Body>
    );
  }

  const user = data?.user;
  const counts = data?.counts || { total: 0, awaiting: 0, resolved: 0 };
  const inquiries: any[] = data?.inquiries || [];
  const firstName = (user?.name || session?.user?.name || '').split(' ')[0];

  return (
    <>
      <Head>
        <Container>
          <Eyebrow>Supporter account</Eyebrow>
          <H1 style={{ marginTop: 10, marginBottom: 10 }}>Welcome back{firstName ? `, ${firstName}` : ''}</H1>
          <Lead>Keep track of your inquiries, discover new causes, and manage your account.</Lead>
        </Container>
      </Head>
      <Body>
        <Container>
          <Grid>
            <Side>
              <Profile>
                <div className="avrow">
                  <div className="av">{(user?.initial || firstName.charAt(0) || '?').toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="n">{user?.name || session?.user?.name}</div>
                    <div className="e">{user?.email || session?.user?.email}</div>
                  </div>
                </div>
                <div className="meta">
                  <div className="row"><span className="lbl">Role</span><span>Supporter</span></div>
                  <div className="row">
                    <span className="lbl">Email</span>
                    {user?.emailVerified
                      ? <span className="vrf"><Check size={11} strokeWidth={3} />Verified</span>
                      : <span className="pnd">Unverified</span>}
                  </div>
                  {user?.createdAt && (
                    <div className="row">
                      <span className="lbl">Member since</span>
                      <span>{new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </Profile>
              <NavCard>
                <Link href="/causes"><Compass size={16} />Explore causes</Link>
                <Link href="/organizations"><Heart size={16} />Browse organizations</Link>
                <Link href="/impact"><MessageSquare size={16} />Impact &amp; updates</Link>
                <Link href="/how-it-works"><Settings size={16} />How it works</Link>
                <button className="danger" onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut size={16} />Sign out
                </button>
              </NavCard>
            </Side>

            <div>
              <Stat>
                <StatBox><div className="v">{counts.total}</div><div className="l">Inquiries sent</div></StatBox>
                <StatBox><div className="v">{counts.awaiting}</div><div className="l">Awaiting reply</div></StatBox>
                <StatBox><div className="v">{counts.resolved}</div><div className="l">Resolved</div></StatBox>
              </Stat>

              <Panel style={{ marginBottom: 20 }}>
                <PanelHead>
                  <div>
                    <div className="t">Your inquiries</div>
                    <div className="s">Messages you have sent to organizations and causes from this email.</div>
                  </div>
                </PanelHead>
                {!loaded ? (
                  <div style={{ padding: 32, textAlign: 'center', color: '#64748B', fontSize: 13 }}>Loading…</div>
                ) : inquiries.length === 0 ? (
                  <div style={{ padding: '4px 22px 24px' }}>
                    <EmptyState
                      icon={<MessageSquare size={24} />}
                      title="No inquiries yet"
                      body="When you contact an organization or ask about a cause, your conversation will appear here."
                      primaryHref="/causes"
                      primaryLabel="Browse causes"
                    />
                  </div>
                ) : (
                  <InqList>
                    {inquiries.map((i) => (
                      <div className="r" key={i.id}>
                        <div className="ic"><Mail size={15} /></div>
                        <div className="m">
                          <div className="sub">{i.subject}</div>
                          <div className="meta">
                            <span>{i.scope === 'cause' ? 'About a cause' : i.scope === 'organization' ? 'To an organization' : 'General'}</span>
                            <span>·</span>
                            <span>{i.messagesCount} message{i.messagesCount === 1 ? '' : 's'}</span>
                            <span>·</span>
                            <span><Clock size={10} style={{ verticalAlign: '-1px' }} /> {relativeDate(i.createdAt)}</span>
                          </div>
                        </div>
                        <span className={`st ${i.status}`}>{i.status}</span>
                      </div>
                    ))}
                  </InqList>
                )}
              </Panel>

              <Panel>
                <PanelHead>
                  <div>
                    <div className="t">Discover</div>
                    <div className="s">Find causes aligned with the change you care about.</div>
                  </div>
                </PanelHead>
                <div style={{ padding: '0 22px 22px' }}>
                  <Explore>
                    <Link href="/causes" className="qb">
                      <div className="qi"><Search size={18} /></div>
                      <div>
                        <div className="qt">Browse all causes</div>
                        <div className="qs">Filter by category, region, or verification status.</div>
                      </div>
                    </Link>
                    <Link href="/organizations" className="qb">
                      <div className="qi"><Heart size={18} /></div>
                      <div>
                        <div className="qt">Approved organizations</div>
                        <div className="qs">See which humanitarian partners are active on the platform.</div>
                      </div>
                    </Link>
                  </Explore>
                </div>
              </Panel>
            </div>
          </Grid>
        </Container>
      </Body>
    </>
  );
}
