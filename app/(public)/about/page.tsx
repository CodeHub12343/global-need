'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { Shield, Lock, Users, Search, FilePlus, CheckSquare, LineChart, UserCircle, Building2, FileText } from 'lucide-react';
import { Container, Section } from '@/components/ui/Container';
import { Display, H2, H3, Eyebrow, Lead } from '@/components/ui/Typography';
import { LinkButton } from '@/components/ui/Button';

const Hero = styled.section`
  padding: 72px 0 56px;
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.primary50}, transparent);
  .grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; align-items: center; @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; gap: 28px; } }
  .photo { position: relative; height: 340px; border-radius: 18px; overflow: hidden; background: linear-gradient(135deg,#0F766E,#115E59) center/cover no-repeat; box-shadow: ${({ theme }) => theme.shadows.md}; }
  .photo .chip { position: absolute; left: 18px; bottom: 18px; background: rgba(255,255,255,.94); backdrop-filter: blur(6px); color: ${({ theme }) => theme.colors.ink}; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; display:flex; align-items:center; gap:8px; }
  .photo .chip .dot { width: 8px; height: 8px; border-radius: 999px; background: ${({ theme }) => theme.colors.primary}; }
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { .photo { height: 220px; } }
`;
const Two = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 48px;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; gap: 24px; }
  p { font-size: 15px; margin: 0 0 12px; line-height: 1.65; }
`;
const Values = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 28px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Val = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 24px;
  .ic { width: 42px; height: 42px; border-radius: 9px; background: ${({ theme }) => theme.colors.primary50}; color: ${({ theme }) => theme.colors.primary}; display: grid; place-items: center; margin-bottom: 12px; }
  h4 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 18px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 8px; font-weight: 600; }
  p { font-size: 14px; color: ${({ theme }) => theme.colors.muted}; margin: 0; line-height: 1.55; }
`;
const Steps = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 28px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; }
`;
const Step = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  .n { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 14px; color: ${({ theme }) => theme.colors.primary}; font-weight: 700; margin-bottom: 10px; }
  .big { position: absolute; top: 18px; right: 20px; font-family: ${({ theme }) => theme.fonts.serif}; font-size: 60px; font-weight: 600; color: ${({ theme }) => theme.colors.primary50}; line-height: 1; }
  h4 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 19px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 8px; font-weight: 600; position: relative; z-index: 1; }
  p { font-size: 14px; color: ${({ theme }) => theme.colors.muted}; margin: 0; line-height: 1.55; position: relative; z-index: 1; }
`;
const Roles = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; }
`;
const Role = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 22px;
  .ri { width: 38px; height: 38px; border-radius: 8px; background: ${({ theme }) => theme.colors.accent50}; color: ${({ theme }) => theme.colors.accent}; display: grid; place-items: center; margin-bottom: 12px; }
  h4 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 16px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 6px; font-weight: 600; }
  p { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; margin: 0; line-height: 1.5; }
`;
const Faq = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  margin-top: 20px;
  overflow: hidden;
  details { border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
  details:last-child { border-bottom: none; }
  summary { padding: 18px 22px; cursor: pointer; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; font-size: 15px; display: flex; justify-content: space-between; align-items: center; list-style: none; }
  summary::-webkit-details-marker { display: none; }
  summary::after { content: "+"; font-size: 22px; color: ${({ theme }) => theme.colors.muted}; font-weight: 400; }
  details[open] summary::after { content: "−"; }
  details[open] summary { background: ${({ theme }) => theme.colors.bg}; }
  .ans { padding: 0 22px 20px; font-size: 14px; color: ${({ theme }) => theme.colors.muted}; line-height: 1.6; }
`;
const MissionStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: 28px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: repeat(2, 1fr); }
`;
const MsTile = styled.div<{ $img: string }>`
  position: relative;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  background: #0b1f2a url(${(p) => p.$img}) center/cover no-repeat;
  &::after { content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.65) 100%); }
  .cap { position: absolute; left: 14px; right: 14px; bottom: 12px; color: #fff; z-index: 1; font-size: 13px; font-weight: 600; font-family: ${({ theme }) => theme.fonts.serif}; }
`;
const Cta = styled.div`
  background: linear-gradient(135deg, rgba(19,78,74,.92), rgba(15,118,110,.88)), url('/landing/community-group.jpg') center/cover no-repeat;
  color: #fff;
  border-radius: 20px;
  padding: 44px;
  margin: 48px 0 0;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 28px;
  align-items: center;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; padding: 28px; }
  h2 { color: #fff; margin-bottom: 14px; }
  p { color: rgba(255,255,255,.85); margin: 0 0 20px; font-size: 15px; }
  .inner-card { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); border-radius: 14px; padding: 22px; }
`;

export default function AboutPage() {
  return (
    <>
      <Hero>
        <Container>
          <div className="grid">
            <div>
              <Eyebrow>About &amp; how it works</Eyebrow>
              <Display style={{ marginTop: 14, marginBottom: 16 }}>
                A trustworthy place for humanitarian causes to be seen.
              </Display>
              <Lead>
                Meeting Global Needs is a cause discovery and verification platform that connects
                approved humanitarian organizations with the people who want to support them — through
                independent review and radical transparency.
              </Lead>
            </div>
            <div className="photo" style={{ backgroundImage: "url('/landing/humanitarian.jpg')" }}>
              <div className="chip"><span className="dot" />Independently reviewed · Published 2026</div>
            </div>
          </div>
        </Container>
      </Hero>

      <Section $bg="surface">
        <Container>
          <Two>
            <div>
              <Eyebrow>Our mission</Eyebrow>
              <H3 style={{ marginTop: 6 }}>Protect dignity. Earn trust. Help work travel farther.</H3>
            </div>
            <div>
              <p>
                Humanitarian need travels fast online. Verified information doesn't always keep up.
                Meeting Global Needs exists to narrow that gap — by giving approved organizations a
                straightforward way to present their causes, and giving supporters a dependable way
                to engage.
              </p>
              <p>
                We never invent outcomes, never display donation totals we can't verify, and never
                expose identifiable information of vulnerable beneficiaries. Public visibility is a
                privilege our reviewers grant only after clear evidence is in hand.
              </p>
            </div>
          </Two>
          <Values>
            <Val><div className="ic"><Shield size={20} /></div><h4>Transparent by default</h4><p>Every cause and update passes through a documented review. Decisions are recorded and shared with organizations.</p></Val>
            <Val><div className="ic"><Lock size={20} /></div><h4>Privacy preserving</h4><p>Supporting documents stay private. Identifying information about children and patients is never displayed publicly.</p></Val>
            <Val><div className="ic"><Users size={20} /></div><h4>Human-centered</h4><p>Organizations are approved individually. Representatives have a real dashboard, a real inbox, and a real reviewer on the other side.</p></Val>
          </Values>
          <MissionStrip>
            <MsTile $img="/landing/education.jpg"><div className="cap">Education programs</div></MsTile>
            <MsTile $img="/landing/healthcare.jpg"><div className="cap">Community healthcare</div></MsTile>
            <MsTile $img="/landing/3.jpg"><div className="cap">Mental health support</div></MsTile>
            <MsTile $img="/landing/4.jpg"><div className="cap">Adaptive programs</div></MsTile>
          </MissionStrip>
        </Container>
      </Section>

      <Section $bg="bg">
        <Container>
          <Eyebrow>How it works</Eyebrow>
          <H2 style={{ marginTop: 10, marginBottom: 12 }}>Four steps, one standard.</H2>
          <Lead>
            The same path every cause follows — from submission to public visibility to ongoing
            updates.
          </Lead>
          <Steps>
            <Step><div className="big">1</div><div className="n">Step 01</div><h4>Discover</h4><p>Visitors explore published causes, organizations, and updates by category, region, or verification status.</p></Step>
            <Step><div className="big">2</div><div className="n">Step 02</div><h4>Submit</h4><p>Approved organizations submit causes through a multi-step form with supporting documentation and intended use.</p></Step>
            <Step><div className="big">3</div><div className="n">Step 03</div><h4>Verify &amp; publish</h4><p>Independent reviewers examine the submission privately, approve, reject, or request changes with a recorded reason.</p></Step>
            <Step><div className="big">4</div><div className="n">Step 04</div><h4>Track &amp; communicate</h4><p>Organizations publish approved progress updates and respond to inquiries — supporters follow real outcomes.</p></Step>
          </Steps>
        </Container>
      </Section>

      <Section $bg="surface">
        <Container>
          <Eyebrow>Who's here</Eyebrow>
          <H2 style={{ marginTop: 10, marginBottom: 12 }}>Roles on the platform</H2>
          <Roles>
            <Role><div className="ri"><Search size={18} /></div><h4>Public visitor</h4><p>Browse published causes, read updates, and submit inquiries.</p></Role>
            <Role><div className="ri"><UserCircle size={18} /></div><h4>Registered supporter</h4><p>Manage personal details and track your inquiries in one place.</p></Role>
            <Role><div className="ri"><Building2 size={18} /></div><h4>Cause representative</h4><p>Submit causes, post updates, and respond to inquiries on behalf of your organization.</p></Role>
            <Role><div className="ri"><FileText size={18} /></div><h4>Organization administrator</h4><p>Manage representatives, causes, and the organization's public profile.</p></Role>
            <Role><div className="ri"><CheckSquare size={18} /></div><h4>Cause reviewer</h4><p>Inspect submissions privately and decide what reaches the public.</p></Role>
            <Role><div className="ri"><Shield size={18} /></div><h4>Super administrator</h4><p>Oversee organizations, reviewers, categories, and platform policy.</p></Role>
          </Roles>
        </Container>
      </Section>

      <Section $bg="bg">
        <Container>
          <Eyebrow>FAQ</Eyebrow>
          <H2 style={{ marginTop: 10, marginBottom: 12 }}>Frequently asked</H2>
          <Faq>
            <details open><summary>How do you verify organizations?</summary><div className="ans">Representatives submit organization information and supporting documentation. An independent reviewer examines registration, governance records, and reference material. Only after approval can an organization publish causes.</div></details>
            <details><summary>Does Meeting Global Needs process donations?</summary><div className="ans">Not in this release. Cause pages may present organization-approved contact and support instructions. We do not operate a donation checkout, hold funds, or publish donation totals.</div></details>
            <details><summary>What does a "verified" badge mean?</summary><div className="ans">It means the organization has passed our verification process and remains in good standing. The badge does not endorse specific outcomes — those are the organization's own, and are reviewed before publishing.</div></details>
            <details><summary>How is beneficiary privacy protected?</summary><div className="ans">Identifying information of children, patients, and other vulnerable beneficiaries is never displayed publicly. Photography is reviewed for consent documentation before updates go live.</div></details>
            <details><summary>How can I submit an inquiry?</summary><div className="ans">Use the inquiry form on any cause or organization page, or our general contact form. Inquiries route to the right team through the platform.</div></details>
          </Faq>

          <Cta>
            <div>
              <H2 style={{ color: '#fff' }}>Represent a humanitarian organization?</H2>
              <p>Create an account and start your submission. Independent review usually takes a few days.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <LinkButton as={Link} href="/register" $variant="primary" $size="md" style={{ background: '#fff', color: '#134E4A' }}>
                  Create an organization account
                </LinkButton>
                <Link href="/about" style={{ color: '#fff', padding: '10px 14px', fontWeight: 600 }}>Read submission guidelines ›</Link>
              </div>
            </div>
            <div className="inner-card">
              <div style={{ fontSize: 12, color: '#5EEAD4', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Already a representative?
              </div>
              <Link href="/sign-in" style={{ color: '#fff', fontWeight: 600}}>Sign in to your dashboard →</Link>
            </div>
          </Cta>
        </Container>
      </Section>
    </>
  );
}
