'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Info, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import styled from 'styled-components';
import { Button } from '@/components/ui/Button';
import { Field, Label } from '@/components/ui/Form';
import { Eyebrow } from '@/components/ui/Typography';

const Back = styled(Link)`
  display: inline-flex; align-items: center; gap: 6px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px; font-weight: 600; margin-bottom: 16px; text-decoration: none;
`;
const Ic = styled.div`
  position: relative;
  svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.muted}; }
  input {
    width: 100%; padding: 11px 14px 11px 44px;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: 10px; font-size: 14px; font-family: inherit; background: #fff;
    &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px rgba(15,118,110,.12); }
  }
`;
const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.primary50};
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  color: ${({ theme }) => theme.colors.primary800};
  padding: 12px 14px; border-radius: 10px;
  font-size: 13px; margin: 16px 0;
  display: flex; gap: 10px; line-height: 1.55;
  svg { flex-shrink: 0; margin-top: 1px; }
`;
const Alert = styled.div<{ $tone?: 'success' | 'error' }>`
  display: flex; gap: 10px; align-items: flex-start;
  background: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success50 : theme.colors.error50)};
  color: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
  border: 1px solid ${({ $tone }) => ($tone === 'success' ? '#86EFAC' : '#fecaca')};
  border-radius: 10px; padding: 10px 12px; font-size: 13px; margin-bottom: 16px;
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Request failed');
      setSent(true);
    } catch {
      setErr('Could not send reset email. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Back href="/sign-in"><ArrowLeft size={14} />Back to sign in</Back>
      <Eyebrow>Password reset</Eyebrow>
      <h1 style={{ fontFamily: 'Lora, serif', fontSize: 28, fontWeight: 600, margin: '8px 0 10px' }}>
        Reset your password
      </h1>
      <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 24px', lineHeight: 1.55 }}>
        Enter the email address associated with your account. We'll send you a link to set a new
        password. The link is valid for 60 minutes.
      </p>
      {err && <Alert><AlertCircle size={16} />{err}</Alert>}
      {sent && (
        <Alert $tone="success">
          <CheckCircle2 size={16} />
          If an account exists for <strong style={{ marginLeft: 4 }}>{email}</strong>, we've sent reset instructions.
        </Alert>
      )}
      <form onSubmit={submit}>
        <Field>
          <Label htmlFor="email">Email address</Label>
          <Ic>
            <Mail size={16} />
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </Ic>
        </Field>
        <Button type="submit" $variant="primary" $size="lg" $block disabled={submitting}>
          {submitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
      <InfoBox>
        <Info size={16} />
        <div>If an account exists for this email, you'll receive an instructions email within a few minutes. Check your spam folder if it doesn't appear.</div>
      </InfoBox>
      <div style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: 20 }}>
        Remember your password?{' '}
        <Link href="/sign-in" style={{ color: '#115E59', fontWeight: 600 }}>Sign in instead</Link>
      </div>
    </>
  );
}
