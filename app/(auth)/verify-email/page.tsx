'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import styled from 'styled-components';
import { Button } from '@/components/ui/Button';

const Wrap = styled.div` text-align: center; `;
const Hero = styled.div`
  width: 72px; height: 72px; border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary50};
  color: ${({ theme }) => theme.colors.primary};
  display: inline-grid; place-items: center; margin-bottom: 20px;
`;
const Otp = styled.div`
  display: flex; gap: 10px; justify-content: center; margin: 20px 0;
  input {
    width: 52px; height: 62px;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: 12px;
    font-size: 24px; text-align: center; font-weight: 700;
    color: ${({ theme }) => theme.colors.ink}; background: #fff; font-family: inherit;
    &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px rgba(15,118,110,.12); }
  }
`;
const Alert = styled.div<{ $tone?: 'success' | 'error' }>`
  display: flex; gap: 10px; align-items: flex-start;
  background: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success50 : theme.colors.error50)};
  color: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
  border: 1px solid ${({ $tone }) => ($tone === 'success' ? '#86EFAC' : '#fecaca')};
  border-radius: 10px; padding: 10px 12px; font-size: 13px; margin-bottom: 16px; text-align: left;
`;

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') ?? '';

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  const setDigit = (i: number, v: string) => {
    const only = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = only;
    setDigits(next);
    if (only && i < 5) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = text.split('').concat(Array(6).fill('')).slice(0, 6);
    setDigits(next);
    inputs.current[Math.min(text.length, 5)]?.focus();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) return setErr('Enter the 6-digit code.');
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || 'Verification failed');
      setNotice('Email verified. Redirecting to sign in…');
      setTimeout(() => router.push('/sign-in?verified=1'), 800);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setErr(null);
    setNotice(null);
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) setNotice('A new code has been sent to your email.');
    else setErr('Could not resend code.');
  };

  return (
    <Wrap>
      <Hero><Mail size={30} /></Hero>
      <h1 style={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, margin: '0 0 10px' }}>
        Check your inbox
      </h1>
      <p style={{ fontSize: 14, color: '#64748B', margin: '0 auto 24px', lineHeight: 1.6, maxWidth: 380 }}>
        We've sent a 6-digit verification code to{' '}
        <strong>{email || 'your email'}</strong>. Enter it below to activate your account.
      </p>

      {err && <Alert><AlertCircle size={16} />{err}</Alert>}
      {notice && <Alert $tone="success"><CheckCircle2 size={16} />{notice}</Alert>}

      <form onSubmit={submit}>
        <Otp onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </Otp>
        <Button type="submit" $variant="primary" $size="lg" $block disabled={submitting}>
          {submitting ? 'Verifying…' : 'Verify & continue'}
        </Button>
      </form>

      <div style={{ marginTop: 14, fontSize: 13, color: '#64748B' }}>
        Didn't get it?{' '}
        <button
          type="button"
          onClick={resend}
          style={{ color: '#115E59', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13 }}
        >
          Resend code
        </button>
      </div>
    </Wrap>
  );
}
