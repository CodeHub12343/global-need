'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { ArrowRight, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Label, Hint } from '@/components/ui/Form';
import { Eyebrow } from '@/components/ui/Typography';

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 30px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  letter-spacing: -0.01em;
  margin: 8px 0 10px;
`;
const Lead = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
  margin: 0 0 28px;
  line-height: 1.55;
`;
const Ic = styled.div`
  position: relative;
  svg.lead { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.muted}; pointer-events: none; }
  input {
    width: 100%;
    padding: 11px 14px 11px 44px;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: 10px;
    font-size: 14px;
    font-family: inherit;
    background: #fff;
    &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px rgba(15,118,110,.12); }
  }
  .eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.colors.muted}; background: none; border: none; cursor: pointer; display: grid; place-items: center; }
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 22px;
  label { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: ${({ theme }) => theme.colors.text}; }
  a { color: ${({ theme }) => theme.colors.primary700}; font-size: 13px; font-weight: 600; }
`;
const Alert = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: ${({ theme }) => theme.colors.error50};
  color: ${({ theme }) => theme.colors.error};
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  margin-bottom: 16px;
`;
const Alt = styled.div`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 24px;
  a { color: ${({ theme }) => theme.colors.primary700}; font-weight: 600; }
`;

type SignInValues = { email: string; password: string; remember: boolean };

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '';

  const destinationFor = (role?: string) => {
    if (role === 'super_admin') return '/admin';
    if (role === 'reviewer' || role === 'senior_reviewer') return '/reviewer';
    if (role === 'representative' || role === 'org_admin') return '/dashboard';
    return '/account';
  };
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({ defaultValues: { email: '', password: '', remember: true } });

  const onSubmit = async (data: SignInValues) => {
    setError(null);
    setSubmitting(true);
    const res = await signIn('credentials', {
      redirect: false,
      email: data.email.toLowerCase(),
      password: data.password,
    });
    if (!res || res.error) {
      setSubmitting(false);
      setError(res?.error === 'Account suspended' ? 'Account suspended. Contact support.' : 'Invalid email or password.');
      return;
    }
    let dest = callbackUrl;
    if (!dest) {
      try {
        const meRes = await fetch('/api/auth/me');
        const me = await meRes.json();
        dest = destinationFor(me?.data?.user?.role || me?.user?.role);
      } catch {
        dest = '/account';
      }
    }
    setSubmitting(false);
    router.push(dest);
    router.refresh();
  };

  return (
    <>
      <Eyebrow>Welcome back</Eyebrow>
      <Title>Sign in to your account</Title>
      <Lead>Access your organization dashboard, track cause submissions, and respond to inquiries.</Lead>
      {error && (<Alert><AlertCircle size={16} /><div>{error}</div></Alert>)}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field>
          <Label htmlFor="email">Email address</Label>
          <Ic>
            <Mail size={16} className="lead" />
            <input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email}
              {...register('email', { required: true, pattern: /^\S+@\S+\.\S+$/ })} />
          </Ic>
          {errors.email && <Hint $error>Please enter a valid email address.</Hint>}
        </Field>
        <Field>
          <Label htmlFor="password">Password</Label>
          <Ic>
            <Lock size={16} className="lead" />
            <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password"
              aria-invalid={!!errors.password} {...register('password', { required: true, minLength: 1 })} />
            <button type="button" className="eye" onClick={() => setShow((v) => !v)} aria-label="Show password">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </Ic>
        </Field>
        <Row>
          <label><input type="checkbox" {...register('remember')} />Remember me on this device</label>
          <Link href="/forgot-password">Forgot password?</Link>
        </Row>
        <Button type="submit" $variant="primary" $size="lg" $block disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'} <ArrowRight size={16} />
        </Button>
      </form>
      <Alt>New to Meeting Global Needs? <Link href="/register">Create an account</Link></Alt>
    </>
  );
}
