'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';
import { AlertCircle, Building2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select, Hint } from '@/components/ui/Form';
import { Eyebrow } from '@/components/ui/Typography';

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  letter-spacing: -0.01em;
  margin: 8px 0 10px;
`;
const Lead = styled.p` font-size: 14px; color: ${({ theme }) => theme.colors.muted}; margin: 0 0 20px; line-height: 1.55; `;
const Alert = styled.div`
  display: flex; gap: 10px; align-items: flex-start;
  background: ${({ theme }) => theme.colors.error50};
  color: ${({ theme }) => theme.colors.error};
  border: 1px solid #fecaca; border-radius: 10px; padding: 10px 12px; font-size: 13px; margin-bottom: 16px;
`;
const TypePick = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 22px; `;
const Tp = styled.button<{ $active?: boolean }>`
  padding: 16px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.borderStrong)};
  border-radius: 12px;
  cursor: pointer;
  background: ${({ $active, theme }) => ($active ? theme.colors.primary50 : '#fff')};
  box-shadow: ${({ $active }) => ($active ? '0 0 0 2px rgba(15,118,110,.08)' : 'none')};
  text-align: left;
  font-family: inherit;
  .ti { width: 34px; height: 34px; border-radius: 8px; background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.primary50)}; color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.primary700)}; display: grid; place-items: center; margin-bottom: 10px; }
  .tn { font-size: 14px; font-weight: 700; color: ${({ theme }) => theme.colors.ink}; }
  .ts { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-top: 3px; line-height: 1.4; }
`;
const Fg = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; }
`;
const Strength = styled.div`
  display: flex; gap: 4px; margin-top: 8px;
  span { height: 4px; flex: 1; border-radius: 2px; background: ${({ theme }) => theme.colors.border}; }
  span.on { background: ${({ theme }) => theme.colors.success}; }
`;
const Consent = styled.label`
  display: flex; gap: 10px; align-items: flex-start; margin: 4px 0 18px;
  font-size: 13px; color: ${({ theme }) => theme.colors.text}; line-height: 1.5;
  input { accent-color: ${({ theme }) => theme.colors.primary}; margin-top: 3px; }
  a { color: ${({ theme }) => theme.colors.primary700}; font-weight: 600; }
`;

export default function RegisterPage() {
  const router = useRouter();
  const [type, setType] = useState<'representative' | 'supporter'>('representative');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [country, setCountry] = useState('');
  const [role, setRole] = useState('Executive / founder');
  const [pw, setPw] = useState('');
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = Math.min(
    4,
    (pw.length >= 10 ? 1 : 0) +
      (/[A-Z]/.test(pw) && /[a-z]/.test(pw) ? 1 : 0) +
      (/\d/.test(pw) ? 1 : 0) +
      (/[^A-Za-z0-9]/.test(pw) ? 1 : 0),
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, email, password: pw,
          accountType: type,
          organizationName: type === 'representative' ? orgName : undefined,
          country, role, consent,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        const det = payload?.details?.fieldErrors
          ? Object.values(payload.details.fieldErrors).flat().join(' ')
          : '';
        throw new Error(det || payload?.error || 'Could not create account');
      }
      router.push(`/sign-in?email=${encodeURIComponent(email)}&registered=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Eyebrow>Create an account</Eyebrow>
      <Title>Join Meeting Global Needs</Title>
      <Lead>Choose how you'd like to get started. You can always add organization details later.</Lead>
      {error && (<Alert><AlertCircle size={16} /><div>{error}</div></Alert>)}

      <TypePick>
        <Tp type="button" $active={type === 'representative'} onClick={() => setType('representative')}>
          <div className="ti"><Building2 size={18} /></div>
          <div className="tn">Organization representative</div>
          <div className="ts">Submit causes and manage an organization.</div>
        </Tp>
        <Tp type="button" $active={type === 'supporter'} onClick={() => setType('supporter')}>
          <div className="ti"><UserCircle size={18} /></div>
          <div className="tn">Supporter</div>
          <div className="ts">Follow causes and submit inquiries.</div>
        </Tp>
      </TypePick>

      <form onSubmit={submit}>
        <Fg>
          <Field><Label>First name</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></Field>
          <Field><Label>Last name</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} required /></Field>
        </Fg>
        <Field>
          <Label>Email address</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Hint>We'll send a verification code to this address.</Hint>
        </Field>
        {type === 'representative' && (
          <Field>
            <Label>Organization name</Label>
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
            <Hint>You can edit this later in the organization profile.</Hint>
          </Field>
        )}
        <Fg>
          <Field>
            <Label>Country</Label>
            <Select value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">Select a country</option>
              <option>Kenya</option>
              <option>Ghana</option>
              <option>South Africa</option>
              <option>Rwanda</option>
              <option>Tanzania</option>
              <option>Ethiopia</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Germany</option>
              <option>India</option>
              <option>Philippines</option>
              <option>Other</option>
            </Select>
          </Field>
          <Field>
            <Label>{type === 'representative' ? 'Role' : 'How did you hear about us?'}</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              {type === 'representative' ? (
                <>
                  <option>Executive / founder</option>
                  <option>Program director</option>
                  <option>Communications</option>
                  <option>Volunteer coordinator</option>
                </>
              ) : (
                <>
                  <option>Search</option>
                  <option>Social media</option>
                  <option>A friend</option>
                  <option>News article</option>
                </>
              )}
            </Select>
          </Field>
        </Fg>
        <Field>
          <Label>Create a password</Label>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
          <Strength>
            {[1, 2, 3, 4].map((i) => <span key={i} className={strength >= i ? 'on' : ''} />)}
          </Strength>
          <Hint>Use at least 10 characters with upper &amp; lower case and a number.</Hint>
        </Field>
        <Consent>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            I agree to the <Link href="/about">Terms of Service</Link> and{' '}
            <Link href="/about">Privacy Policy</Link>, and understand that cause submissions are
            subject to independent review.
          </span>
        </Consent>
        <Button type="submit" $variant="primary" $size="lg" $block disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <div style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: 18 }}>
        Already have an account?{' '}
        <Link href="/sign-in" style={{ color: '#115E59', fontWeight: 600 }}>Sign in</Link>
      </div>
    </>
  );
}
