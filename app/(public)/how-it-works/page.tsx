'use client';

import Link from 'next/link';
import styled from 'styled-components';
import {
  Search,
  FilePlus,
  CheckSquare,
  LineChart,
  Shield,
  Lock,
  Eye,
  Users,
  HeartHandshake,
  Building2,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Container, Section } from '@/components/ui/Container';
import { Display, H2, H3, Eyebrow, Lead } from '@/components/ui/Typography';
import { LinkButton } from '@/components/ui/Button';

const Head = styled.section`
  padding: 72px 0 56px;
  background:
    linear-gradient(90deg, #fff 0%, rgba(255,255,255,.96) 45%, rgba(255,255,255,.7) 72%, rgba(255,255,255,.3) 100%),
    url('/landing/clinic.jpg') right center/cover no-repeat;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 36px 0 28px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.94) 55%, rgba(255,255,255,0.88) 100%),
      linear-gradient(180deg, rgba(15,118,110,0.12), rgba(15,118,110,0.04)),
      url('/landing/clinic.jpg') center/cover no-repeat;
  }
`;
const Crumbs = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 12px;
  a { color: ${({ theme }) => theme.colors.muted}; &:hover { color: ${({ theme }) => theme.colors.primary}; } }
`;

const StepTimeline = styled.ol`
  list-style: none;
  padding: 0;
  margin: 32px 0 0;
  display: grid;
  gap: 18px;
  counter-reset: stp;
`;
const StepRow = styled.li`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 24px;
  display: grid;
  grid-template-columns: 56px 1fr auto;
  align-items: center;
  gap: 22px;
  counter-increment: stp;
  position: relative;
  transition: border-color 0.15s, transform 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; transform: translateY(-1px); }
  .num {
    width: 56px; height: 56px;
    border-radius: 14px;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primary800});
    color: #fff;
    display: grid; place-items: center;
    font-family: ${({ theme }) => theme.fonts.serif};
    font-size: 22px;
    font-weight: 700;
  }
  .num::before { content: counter(stp, decimal-leading-zero); }
  .body h3 {
    font-family: ${({ theme }) => theme.fonts.serif};
    font-size: 19px; color: ${({ theme }) => theme.colors.ink};
    margin: 0 0 6px; font-weight: 600;
  }
  .body p {
    margin: 0;
    font-size: 14.5px;
    color: ${({ theme }) => theme.colors.muted};
    line-height: 1.55;
  }
  .ic {
    width: 48px; height: 48px;
    border-radius: 12px;
    background: ${({ theme }) => theme.colors.primary50};
    color: ${({ theme }) => theme.colors.primary};
    display: grid; place-items: center;
    flex-shrink: 0;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 44px 1fr;
    gap: 14px;
    padding: 16px;
    .num { width: 44px; height: 44px; font-size: 17px; border-radius: 11px; }
    .ic { display: none; }
    .body h3 { font-size: 16px; }
    .body p { font-size: 13px; }
  }
`;

const PillarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 28px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Pillar = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 26px;
  .ic {
    width: 44px; height: 44px; border-radius: 11px;
    background: ${({ theme }) => theme.colors.primary50};
    color: ${({ theme }) => theme.colors.primary};
    display: grid; place-items: center;
    margin-bottom: 14px;
  }
  h4 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 18px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 8px; font-weight: 600; }
  p { font-size: 14px; color: ${({ theme }) => theme.colors.muted}; margin: 0 0 12px; line-height: 1.55; }
  ul { list-style: none; padding: 0; margin: 10px 0 0; display: grid; gap: 8px; }
  li { display: flex; align-items: flex-start; gap: 8px; font-size: 13.5px; color: ${({ theme }) => theme.colors.text}; }
  li svg { color: ${({ theme }) => theme.colors.primary}; margin-top: 2px; flex-shrink: 0; }
`;

const PathGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 28px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const PathCard = styled.div<{ $accent: string }>`
  position: relative;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 24px;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: ${({ $accent }) => $accent};
  }
  .ic {
    width: 46px; height: 46px; border-radius: 12px;
    background: ${({ $accent }) => $accent}22;
    color: ${({ $accent }) => $accent};
    display: grid; place-items: center;
    margin-bottom: 12px;
  }
  h4 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 18px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 8px; font-weight: 600; }
  p { font-size: 14px; color: ${({ theme }) => theme.colors.muted}; margin: 0 0 14px; line-height: 1.55; }
  a { display: inline-flex; align-items: center; gap: 6px; color: ${({ $accent }) => $accent}; font-weight: 600; font-size: 14px; text-decoration: none; &:hover { text-decoration: underline; } }
`;

const Faq = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  margin-top: 20px;
  overflow: hidden;
  details { border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
  details:last-child { border-bottom: none; }
  summary {
    padding: 18px 22px;
    cursor: pointer;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.ink};
    font-size: 15px;
    display: flex; justify-content: space-between; align-items: center;
    list-style: none;
  }
  summary::-webkit-details-marker { display: none; }
  summary::after { content: "+"; font-size: 22px; color: ${({ theme }) => theme.colors.muted}; font-weight: 400; }
  details[open] summary::after { content: "−"; }
  details[open] summary { background: ${({ theme }) => theme.colors.bg}; }
  .ans { padding: 0 22px 20px; font-size: 14px; color: ${({ theme }) => theme.colors.muted}; line-height: 1.6; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    summary { padding: 14px 16px; font-size: 14px; }
    .ans { padding: 0 16px 16px; font-size: 13px; }
  }
`;

const Cta = styled.div`
  background: linear-gradient(135deg, rgba(19,78,74,.94), rgba(15,118,110,.90)), url('/landing/community-group.jpg') center/cover no-repeat;
  color: #fff;
  border-radius: 20px;
  padding: 44px;
  margin-top: 40px;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 28px;
  align-items: center;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; padding: 28px; }
  h2 { color: #fff; margin-bottom: 14px; }
  p { color: rgba(255,255,255,.88); margin: 0 0 20px; font-size: 15px; }
  .inner-card {
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 14px;
    padding: 22px;
  }
`;

export default function HowItWorksPage() {
  return (
    <>
      <Head>
        <Container>
          <Crumbs><Link href="/">Home</Link> › <span>How it works</span></Crumbs>
          <Eyebrow>Process</Eyebrow>
          <Display style={{ marginTop: 10, marginBottom: 16 }}>
            A transparent path from need to action.
          </Display>
          <Lead style={{ maxWidth: 680 }}>
            Every cause on Meeting Global Needs passes through four steps designed to protect
            supporters and preserve dignity for the people being served. Here's what happens from
            the moment an organization signs up to the moment a supporter reads a verified update.
          </Lead>
        </Container>
      </Head>

      <Section $bg="surface">
        <Container>
          <Eyebrow>The four steps</Eyebrow>
          <H2 style={{ marginTop: 10, marginBottom: 10 }}>How a cause becomes public</H2>
          <Lead>Same path, same standard — every time.</Lead>
          <StepTimeline>
            <StepRow>
              <span className="num" />
              <div className="body">
                <h3>Register &amp; verify your organization</h3>
                <p>
                  Create an organization account and submit a short profile with registration or
                  governance records. An independent reviewer verifies legitimacy privately — usually
                  within a few days. Nothing is published until you're approved.
                </p>
              </div>
              <span className="ic"><Building2 size={22} /></span>
            </StepRow>
            <StepRow>
              <span className="num" />
              <div className="body">
                <h3>Submit a cause</h3>
                <p>
                  Walk through a guided five-step form: the story, who it supports, the specific need,
                  intended use of resources, and timeline. Attach any documents reviewers may need.
                  Save as a draft and come back whenever.
                </p>
              </div>
              <span className="ic"><FilePlus size={22} /></span>
            </StepRow>
            <StepRow>
              <span className="num" />
              <div className="body">
                <h3>Independent review &amp; publication</h3>
                <p>
                  A trained reviewer examines the submission against a documented checklist —
                  scope, budget, safeguarding, consent. They approve, request changes with specific
                  feedback, or reject with reason. Only approved causes appear publicly.
                </p>
              </div>
              <span className="ic"><CheckSquare size={22} /></span>
            </StepRow>
            <StepRow>
              <span className="num" />
              <div className="body">
                <h3>Post reviewer-approved progress updates</h3>
                <p>
                  As work progresses, post updates with real outcomes — and honest setbacks. Each one
                  passes the same review before it's published, so supporters see verified progress,
                  not polished promises.
                </p>
              </div>
              <span className="ic"><LineChart size={22} /></span>
            </StepRow>
          </StepTimeline>
        </Container>
      </Section>

      <Section $bg="bg">
        <Container>
          <Eyebrow>What we protect</Eyebrow>
          <H2 style={{ marginTop: 10, marginBottom: 10 }}>Three commitments behind every listing</H2>
          <Lead>The verification badge means something because of these three things.</Lead>
          <PillarGrid>
            <Pillar>
              <div className="ic"><Shield size={22} /></div>
              <h4>Independent review</h4>
              <p>
                Every cause and update is read by a trained reviewer — not an algorithm — before it
                reaches a single public visitor.
              </p>
              <ul>
                <li><Check size={14} strokeWidth={3} />Documented checklist, applied the same way every time</li>
                <li><Check size={14} strokeWidth={3} />Decisions recorded in an audit trail</li>
                <li><Check size={14} strokeWidth={3} />Reviewers are independent of the organizations they review</li>
              </ul>
            </Pillar>
            <Pillar>
              <div className="ic"><Lock size={22} /></div>
              <h4>Dignity by design</h4>
              <p>
                Beneficiary privacy is not optional. The platform refuses content that could expose a
                child, patient, or family — however well-intentioned.
              </p>
              <ul>
                <li><Check size={14} strokeWidth={3} />Supporting documents stay private with reviewers</li>
                <li><Check size={14} strokeWidth={3} />Identifying details scrubbed from public listings</li>
                <li><Check size={14} strokeWidth={3} />Photos checked for consent documentation</li>
              </ul>
            </Pillar>
            <Pillar>
              <div className="ic"><Eye size={22} /></div>
              <h4>Honest progress</h4>
              <p>
                We don't publish fabricated outcomes or metrics we can't verify. Organizations report
                what actually happened — including what didn't.
              </p>
              <ul>
                <li><Check size={14} strokeWidth={3} />Progress updates go through the same review</li>
                <li><Check size={14} strokeWidth={3} />Platform stats reflect only what we can verify</li>
                <li><Check size={14} strokeWidth={3} />Setbacks are allowed — and often required — content</li>
              </ul>
            </Pillar>
          </PillarGrid>
        </Container>
      </Section>

      <Section $bg="surface">
        <Container>
          <Eyebrow>Who it's for</Eyebrow>
          <H2 style={{ marginTop: 10, marginBottom: 10 }}>Three paths through the platform</H2>
          <Lead>Each role has its own dashboard and workflow.</Lead>
          <PathGrid>
            <PathCard $accent="#0F766E">
              <div className="ic"><Building2 size={22} /></div>
              <h4>Humanitarian organizations</h4>
              <p>
                Register, get verified, submit causes, and post progress updates. Manage your public
                profile and respond to supporter inquiries from one dashboard.
              </p>
              <Link href="/register?role=org">Register your organization <ArrowRight size={14} /></Link>
            </PathCard>
            <PathCard $accent="#B45309">
              <div className="ic"><HeartHandshake size={22} /></div>
              <h4>Supporters</h4>
              <p>
                Discover verified humanitarian causes, follow organizations you trust, and reach out
                through the inquiry system. No donation processing on the platform itself — we direct
                you to the organization's own channels.
              </p>
              <Link href="/causes">Browse causes <ArrowRight size={14} /></Link>
            </PathCard>
            <PathCard $accent="#5B21B6">
              <div className="ic"><Users size={22} /></div>
              <h4>Reviewers</h4>
              <p>
                Trained reviewers inspect submissions privately, follow a documented checklist, and
                decide what reaches the public. Every decision carries a recorded reason.
              </p>
              <Link href="/about">Learn about our reviewers <ArrowRight size={14} /></Link>
            </PathCard>
          </PathGrid>
        </Container>
      </Section>

      <Section $bg="bg">
        <Container>
          <Eyebrow>Common questions</Eyebrow>
          <H2 style={{ marginTop: 10, marginBottom: 10 }}>What you might be wondering</H2>
          <Faq>
            <details open>
              <summary>How long does verification take?</summary>
              <div className="ans">
                Organization verification typically takes a few business days once we have the
                documents we need. Cause submissions are usually reviewed within three to five
                business days. Complex cases take longer, and reviewers will keep you updated in
                your dashboard if more information is needed.
              </div>
            </details>
            <details>
              <summary>Does the platform process donations?</summary>
              <div className="ans">
                No. Meeting Global Needs focuses on discovery and verification. Each cause page
                presents the organization's own vetted contact or support channels — funds go
                directly to them, not through us. We do not hold donations, process payments, or
                publish donation totals we can't verify.
              </div>
            </details>
            <details>
              <summary>What does the "Verified" badge actually mean?</summary>
              <div className="ans">
                It means the organization has been reviewed and approved by an independent reviewer,
                and that this specific cause passed the same review before being published. The badge
                is about process, not outcomes — the organization's own results are reported
                separately through reviewer-approved progress updates.
              </div>
            </details>
            <details>
              <summary>Is the platform free for humanitarian organizations?</summary>
              <div className="ans">
                Yes. Registration, verification, cause submissions, and progress updates are all free.
                We fund the review team so public listings stay trustworthy, not through fees that
                would put small organizations at a disadvantage.
              </div>
            </details>
            <details>
              <summary>Can a cause be removed after it's published?</summary>
              <div className="ans">
                Yes. Organizations can archive their own causes. Reviewers can also suspend or remove
                a cause if new information shows it no longer meets our standards — every action is
                recorded and the organization is notified.
              </div>
            </details>
          </Faq>

          <Cta>
            <div>
              <H2 style={{ color: '#fff' }}>Ready to be reviewed?</H2>
              <p>
                If you run a humanitarian organization, register now to begin the verification
                process. We onboard founding partners personally — expect a real human to be in touch.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <LinkButton as={Link} href="/register?role=org" $variant="primary" $size="md" style={{ background: '#fff', color: '#134E4A' }}>
                  Register your organization
                </LinkButton>
                <Link href="/causes" style={{ color: '#fff', padding: '10px 14px', fontWeight: 600 }}>
                  Browse published causes →
                </Link>
              </div>
            </div>
            <div className="inner-card">
              <div style={{ fontSize: 12, color: '#5EEAD4', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Already registered?
              </div>
              <Link href="/sign-in" style={{ color: '#fff', fontWeight: 600 }}>Sign in to your dashboard →</Link>
            </div>
          </Cta>
        </Container>
      </Section>
    </>
  );
}
