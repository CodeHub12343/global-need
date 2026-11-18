'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';
import { AlertCircle, Check, Circle, Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Label } from '@/components/ui/Form';
import { Eyebrow } from '@/components/ui/Typography';

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 28px; font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin: 8px 0 10px;
`;
const Lead = styled.p` font-size: 14px; color: ${({ theme }) => theme.colors.muted}; margin: 0 0 24px; line-height: 1.55; `;
const Ic = styled.div`
  position: relative;
  svg.lead { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.muted}; }
  input {
    width: 100%; padding: 11px 14px 11px 44px;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: 10px; font-size: 14px; font-family: inherit; background: #fff;
    &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px rgba(15,118,110,.12); }
  }
  .eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.muted}; background: none; border: none; cursor: pointer; }
`;
const Strength = styled.div`
  display: flex; gap: 4px; margin-top: 8px;
  span { height: 4px; flex: 1; border-radius: 2px; background: ${({ theme }) => theme.colors.border}; }
  span.on { background: ${({ theme }) => theme.colors.success}; }
`;
const Reqs = styled.ul`
  list-style: none; padding: 0; margin: 10px 0 0;
  font-size: 12px; color: ${({ theme }) => theme.colors.muted};
  display: grid; grid-template-columns: 1fr 1fr; gap: 4px;
  li { display: flex; align-items: center; gap: 6px; }
  li.ok { color: ${({ theme }) => theme.colors.success}; font-weight: 500; }
`;
const Alert = styled.div`
  display: flex; gap: 10px; align-items: flex-start;
  background: ${({ theme }) => theme.colors.error50};
  color: ${({ theme }) => theme.colors.error};
  border: 1px solid #fecaca; border-radius: 10px; padding: 10px 12px;
  font-size: 13px; margin-bottom: 16px;
`;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [show, setShow] = useState(false);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hasLen = pw.length >= 10;
  const hasCase = /[a-z]/.test(pw) && /[A-Z]/.test(pw);
  const hasNum = /\d/.test(pw);
  const hasSym = /[^A-Za-z0-9]/.test(pw);
  const strength = [hasLen, hasCase, hasNum, hasSym].filter(Boolean).length;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!token) return setErr('Missing reset token. Please use the link from your email.');
    if (pw !== confirm) return setErr('Passwords do not match.');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, password: pw }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || 'Could not reset password');
      router.push('/sign-in?reset=1');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Eyebrow>Password reset</Eyebrow>
      <Title>Set a new password</Title>
      <Lead>Choose a password you don't use elsewhere. The reset link in your email expires 60 minutes after it was sent.</Lead>
      {err && <Alert><AlertCircle size={16} />{err}</Alert>}
      <form onSubmit={submit}>
        <Field>
          <Label>New password</Label>
          <Ic>
            <Lock size={16} className="lead" />
            <input type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} required />
            <button type="button" className="eye" onClick={() => setShow((v) => !v)} aria-label="Show password">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </Ic>
          <Strength>
            {[1, 2, 3, 4].map((i) => <span key={i} className={strength >= i ? 'on' : ''} />)}
          </Strength>
          <Reqs>
            <li className={hasLen ? 'ok' : ''}>{hasLen ? <Check size={12} strokeWidth={3} /> : <Circle size={12} />}At least 10 characters</li>
            <li className={hasCase ? 'ok' : ''}>{hasCase ? <Check size={12} strokeWidth={3} /> : <Circle size={12} />}Upper &amp; lower case</li>
            <li className={hasNum ? 'ok' : ''}>{hasNum ? <Check size={12} strokeWidth={3} /> : <Circle size={12} />}A number</li>
            <li className={hasSym ? 'ok' : ''}>{hasSym ? <Check size={12} strokeWidth={3} /> : <Circle size={12} />}A symbol (recommended)</li>
          </Reqs>
        </Field>
        <Field>
          <Label>Confirm password</Label>
          <Ic>
            <Lock size={16} className="lead" />
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="Re-enter password" />
          </Ic>
        </Field>
        <Button type="submit" $variant="primary" $size="lg" $block style={{ marginTop: 8 }} disabled={submitting}>
          {submitting ? 'Updating…' : 'Set new password & sign in'}
        </Button>
      </form>
    </>
  );
}
