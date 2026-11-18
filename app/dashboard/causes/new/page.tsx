'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { ArrowRight, ArrowLeft, Check, Save, Info } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select, Textarea, Hint } from '@/components/ui/Form';
import { CATEGORIES } from '@/lib/mock-data';
import { dashApi } from '@/lib/dashboard-api';

const STEPS = [
  { id: 1, label: 'Basic', name: 'Basic information' },
  { id: 2, label: 'Organization', name: 'Organization' },
  { id: 3, label: 'Humanitarian need', name: 'Humanitarian need' },
  { id: 4, label: 'Supporting info', name: 'Supporting information' },
  { id: 5, label: 'Review & submit', name: 'Review & submit' },
];

const Stepper = styled.div`
  display: flex;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 28px;
  gap: 0;
  position: relative;
  overflow: hidden;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 14px 16px;
    gap: 0;
    flex-wrap: nowrap;
    align-items: center;
  }
`;
const St = styled.div<{ $done?: boolean; $active?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  .circle { width: 32px; height: 32px; border-radius: 999px;
    background: ${({ $done, $active, theme }) => ($done ? theme.colors.success : $active ? theme.colors.primary : '#fff')};
    border: 2px solid ${({ $done, $active, theme }) => ($done ? theme.colors.success : $active ? theme.colors.primary : theme.colors.border)};
    color: ${({ $done, $active }) => ($done || $active ? '#fff' : '#64748B')};
    font-weight: 700; display: grid; place-items: center; font-size: 13px; flex-shrink: 0; z-index: 1;
    box-shadow: ${({ $active }) => ($active ? '0 0 0 4px rgba(15,118,110,.14)' : 'none')};
  }
  .lbl { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; }
  .nm { font-size: 13px; color: ${({ $active, theme }) => ($active ? theme.colors.primary800 : theme.colors.ink)}; font-weight: 600; }
  .line { position: absolute; top: 16px; left: 50%; right: -50%; height: 2px; background: ${({ $done, theme }) => ($done ? theme.colors.success : theme.colors.border)}; z-index: 0; }
  &:last-child .line { display: none; }
  .text { display: block; min-width: 0; }
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex: 0 0 auto;
    gap: 0;
    .text { display: none; }
    .circle { width: 26px; height: 26px; font-size: 11px; border-width: 2px; }
    &:not(:last-child) { flex: 1; }
    .line {
      position: static;
      flex: 1;
      height: 2px;
      margin: 0 6px;
      background: ${({ $done, theme }) => ($done ? theme.colors.success : theme.colors.border)};
    }
    &:last-child .line { display: none; }
  }
`;
const StepperWrap = styled.div`
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-bottom: 20px;
  }
`;
const MobileStepLabel = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    margin-top: 10px;
    padding: 0 2px;
    .nm { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 15px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
    .ct { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; white-space: nowrap; }
  }
`;
const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 28px;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const FormCard = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 32px;
  margin-bottom: 20px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { padding: 22px; }
`;
const FormHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  gap: 16px;
  flex-wrap: wrap;
  h2 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 22px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 4px; }
  p { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; margin: 0; }
  .save { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: ${({ theme }) => theme.colors.muted}; background: ${({ theme }) => theme.colors.bg}; padding: 6px 10px; border-radius: 999px; svg { color: ${({ theme }) => theme.colors.success}; } }
`;
const Fg = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; }
`;
const Rail = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 16px;
  .rc { background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; padding: 20px; }
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 15px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 10px; font-weight: 600; }
  ul { padding: 0; margin: 0; list-style: none; font-size: 13px; color: ${({ theme }) => theme.colors.text}; display: flex; flex-direction: column; gap: 9px; }
  li { display: flex; gap: 8px; align-items: flex-start; line-height: 1.5; }
  li svg { color: ${({ theme }) => theme.colors.primary}; flex-shrink: 0; margin-top: 3px; }
  .notice { background: ${({ theme }) => theme.colors.primary50}; border: 1px solid ${({ theme }) => theme.colors.primary100}; color: ${({ theme }) => theme.colors.primary800}; padding: 12px 14px; border-radius: 10px; font-size: 12px; line-height: 1.5; }
`;
const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  flex-wrap: wrap;
  gap: 10px;
  .right { display: flex; gap: 10px; }
`;
const Banner = styled.div<{ $tone: 'success' | 'error' }>`
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 14px;
  background: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success50 : theme.colors.error50)};
  color: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
  border: 1px solid ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
`;

const DEFAULT_FORM = {
  title: '',
  category: 'orphanages',
  shortDescription: '',
  story: '',
  country: '',
  city: '',
  need: '',
  whoItSupports: '',
  intendedUse: '',
  whyNow: '',
  primaryAssistance: '',
  timeline: '',
};

export default function NewCausePage() {
  const router = useRouter();
  const search = useSearchParams();
  const editingId = search.get('id') || null;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>(DEFAULT_FORM);
  const [id, setId] = useState<string | null>(editingId);
  const [status, setStatus] = useState<string>('draft');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [consent1, setConsent1] = useState(true);
  const [consent2, setConsent2] = useState(true);
  const dirty = useRef(false);

  useEffect(() => {
    if (editingId) {
      dashApi.causes
        .get(editingId)
        .then((data) => {
          setForm({
            title: data.title || '',
            category: data.category || 'orphanages',
            shortDescription: data.shortDescription || '',
            story: data.story || '',
            country: data.country || '',
            city: data.city || '',
            need: data.need || '',
            whoItSupports: data.whoItSupports || '',
            intendedUse: data.intendedUse || '',
            whyNow: data.whyNow || '',
            primaryAssistance: data.primaryAssistance || '',
            timeline: data.timeline || '',
          });
          setStatus(data.status);
          setLastSavedAt(new Date(data.lastUpdatedAt || data.updatedAt || Date.now()));
        })
        .catch((err: any) => setError(err.message));
    }
  }, [editingId]);

  function patch<K extends keyof typeof DEFAULT_FORM>(k: K, v: string) {
    setForm((f: any) => ({ ...f, [k]: v }));
    dirty.current = true;
  }

  async function saveDraft(): Promise<string | null> {
    if (saving) return id;
    setError(null);
    setSaving(true);
    try {
      if (!id) {
        const data = await dashApi.causes.create({
          title: form.title || 'Untitled draft',
          category: form.category,
          shortDescription: form.shortDescription,
          story: form.story,
          country: form.country,
          city: form.city,
        });
        setId(data.id);
        setStatus(data.status);
        // Patch the rest in a second call
        if (form.need || form.intendedUse || form.whoItSupports || form.whyNow || form.primaryAssistance || form.timeline) {
          const data2 = await dashApi.causes.patch(data.id, form);
          setStatus(data2.status);
        }
        setLastSavedAt(new Date());
        dirty.current = false;
        return data.id;
      }
      const data = await dashApi.causes.patch(id, form);
      setStatus(data.status);
      setLastSavedAt(new Date());
      dirty.current = false;
      return id;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function continueStep() {
    const savedId = await saveDraft();
    if (!savedId) return;
    setStep((s) => Math.min(5, s + 1));
  }

  async function submitForReview() {
    const savedId = await saveDraft();
    if (!savedId) return;
    try {
      await dashApi.causes.submit(savedId);
      setSuccessMsg('Submitted for review. A reviewer will look at it soon.');
      setStatus('pending');
      setTimeout(() => router.push('/dashboard/causes'), 1200);
    } catch (err: any) {
      setError(err.message + (err.details?.missing ? ` — missing: ${err.details.missing.join(', ')}` : ''));
    }
  }

  const current = STEPS[step - 1];
  const savedLabel = lastSavedAt ? `Draft saved · ${relativeTime(lastSavedAt)}` : 'Unsaved draft';

  return (
    <>
      <SessionTopbar fallbackName="Organization" fallbackInitial="O" fallbackRole="Organization" showOrgInsteadOfRole />
      <Crumbs>Dashboard › <a href="/dashboard/causes">My causes</a> › <strong>{id ? 'Edit cause' : 'Submit a cause'}</strong></Crumbs>
      <PageTitle>
        <div>
          <H1>{id ? 'Edit cause' : 'Submit a new cause'}</H1>
          <Muted>
            Complete each section to submit a cause for independent review. You can save a draft at
            any time and return later. Submissions are published only after a reviewer approves.
          </Muted>
        </div>
      </PageTitle>

      <StepperWrap>
      <Stepper>
        {STEPS.map((s) => (
          <St key={s.id} $done={s.id < step} $active={s.id === step}>
            <div className="circle">{s.id < step ? <Check size={14} strokeWidth={3} /> : s.id}</div>
            <div className="text">
              <div className="lbl">Step 0{s.id}</div>
              <div className="nm">{s.label}</div>
            </div>
            <span className="line" />
          </St>
        ))}
      </Stepper>
      <MobileStepLabel>
        <span className="nm">{STEPS.find((s) => s.id === step)?.label}</span>
        <span className="ct">Step {step} of {STEPS.length}</span>
      </MobileStepLabel>
      </StepperWrap>

      <MainGrid>
        <div>
          <FormCard>
            <FormHead>
              <div>
                <h2>{current.name}</h2>
                <p>
                  {step === 1 && 'Start with the public-facing basics of your cause.'}
                  {step === 2 && 'Representative and public contact details for this cause.'}
                  {step === 3 && 'Help reviewers and future supporters understand exactly what your cause does.'}
                  {step === 4 && 'Attach private verification documents and approved media.'}
                  {step === 5 && 'Review everything before sending your cause for independent review.'}
                </p>
              </div>
              <span className="save"><Check size={12} strokeWidth={3} />{saving ? 'Saving…' : savedLabel}</span>
            </FormHead>

            {error && <Banner $tone="error">{error}</Banner>}
            {successMsg && <Banner $tone="success">{successMsg}</Banner>}

            {step === 1 && (
              <>
                <Field><Label>Cause title *</Label><Input value={form.title} onChange={(e) => patch('title', e.target.value)} /></Field>
                <Fg>
                  <Field>
                    <Label>Category *</Label>
                    <Select value={form.category} onChange={(e) => patch('category', e.target.value)}>
                      {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </Select>
                  </Field>
                  <Field><Label>Short description *</Label><Input value={form.shortDescription} onChange={(e) => patch('shortDescription', e.target.value)} /></Field>
                </Fg>
                <Field><Label>Detailed story *</Label><Textarea rows={5} value={form.story} onChange={(e) => patch('story', e.target.value)} /></Field>
                <Fg>
                  <Field><Label>Country *</Label><Input value={form.country} onChange={(e) => patch('country', e.target.value)} placeholder="Uganda" /></Field>
                  <Field><Label>City or region *</Label><Input value={form.city} onChange={(e) => patch('city', e.target.value)} placeholder="Kampala" /></Field>
                </Fg>
              </>
            )}

            {step === 2 && (
              <>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748B' }}>
                  Organization contact details come from your <a href="/dashboard/organization" style={{ color: '#115E59', fontWeight: 600 }}>organization profile</a>.
                  Changes made here apply only to this cause.
                </p>
                <Fg>
                  <Field><Label>Primary assistance needed *</Label><Input value={form.primaryAssistance} onChange={(e) => patch('primaryAssistance', e.target.value)} placeholder="School supplies & nutrition" /></Field>
                  <Field><Label>Expected timeline *</Label><Input value={form.timeline} onChange={(e) => patch('timeline', e.target.value)} placeholder="This school term" /></Field>
                </Fg>
                <Field><Label>Why is support needed now? *</Label><Textarea rows={3} value={form.whyNow} onChange={(e) => patch('whyNow', e.target.value)} /></Field>
              </>
            )}

            {step === 3 && (
              <>
                <Field>
                  <Label>What is the problem this cause addresses? *</Label>
                  <Textarea rows={3} value={form.need} onChange={(e) => patch('need', e.target.value)} />
                  <Hint>Describe the context in plain, respectful language.</Hint>
                </Field>
                <Field>
                  <Label>Who or what does this cause support? *</Label>
                  <Textarea rows={2} value={form.whoItSupports} onChange={(e) => patch('whoItSupports', e.target.value)} />
                  <Hint>Never identify individual beneficiaries publicly.</Hint>
                </Field>
                <Field>
                  <Label>Intended use of support *</Label>
                  <Textarea rows={3} value={form.intendedUse} onChange={(e) => patch('intendedUse', e.target.value)} />
                  <Hint style={{ color: '#115E59', fontWeight: 600 }}>Reviewers will cross-check this against your submitted supporting documents.</Hint>
                </Field>
              </>
            )}

            {step === 4 && (
              <>
                <Field>
                  <Label>Supporting documents</Label>
                  <div style={{ border: '1px dashed #CBD5E1', borderRadius: 10, padding: 24, textAlign: 'center', fontSize: 13, color: '#64748B' }}>
                    Upload private registration/governance docs from the <a href="/dashboard/documents" style={{ color: '#115E59', fontWeight: 600 }}>Documents</a> page.
                    <div style={{ fontSize: 11, marginTop: 6 }}>They stay private — reviewers see them, the public never does.</div>
                  </div>
                </Field>
              </>
            )}

            {step === 5 && (
              <>
                <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Submission summary</div>
                  <div style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 600, color: '#0B1F2A', marginBottom: 6 }}>{form.title || 'Untitled cause'}</div>
                  <div style={{ fontSize: 13, color: '#64748B' }}>{form.category} · {form.city}{form.city && form.country ? ', ' : ''}{form.country}</div>
                </div>
                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14, fontSize: 13 }}>
                  <input type="checkbox" checked={consent1} onChange={(e) => setConsent1(e.target.checked)} />
                  <span>I confirm the information above is accurate and my organization is authorized to submit this cause.</span>
                </label>
                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13 }}>
                  <input type="checkbox" checked={consent2} onChange={(e) => setConsent2(e.target.checked)} />
                  <span>I consent to private documents being reviewed by MGN reviewers and understand they will not be published.</span>
                </label>
              </>
            )}
          </FormCard>

          <Actions>
            <Button type="button" $variant="ghost" $size="md" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>
              <ArrowLeft size={14} />Back to step {step - 1}
            </Button>
            <div className="right">
              <Button $variant="ghost" $size="md" onClick={saveDraft} disabled={saving}><Save size={14} />Save draft</Button>
              {step < 5 ? (
                <Button $variant="primary" $size="md" onClick={continueStep} disabled={saving}>
                  Continue to step {step + 1}<ArrowRight size={14} />
                </Button>
              ) : (
                <Button
                  $variant="primary"
                  $size="md"
                  onClick={submitForReview}
                  disabled={saving || !consent1 || !consent2}
                >
                  Submit for review<ArrowRight size={14} />
                </Button>
              )}
            </div>
          </Actions>
        </div>

        <Rail>
          <div className="rc">
            <h3>Tips for this step</h3>
            <ul>
              <li><Check size={13} strokeWidth={3} />Write in plain, respectful language. Avoid jargon.</li>
              <li><Check size={13} strokeWidth={3} />Never identify individual children or vulnerable people.</li>
              <li><Check size={13} strokeWidth={3} />Be specific about intended use — reviewers check it.</li>
            </ul>
          </div>
          <div className="rc">
            <h3>What reviewers check</h3>
            <ul>
              <li><Info size={13} />Alignment with your organization's mission</li>
              <li><Info size={13} />Realistic timeline and scope</li>
              <li><Info size={13} />Clear intended use of support</li>
            </ul>
          </div>
          <div className="rc">
            <div className="notice"><strong>Privacy reminder.</strong> Supporting documents you link in step 4 stay private. Only approved information appears publicly.</div>
          </div>
        </Rail>
      </MainGrid>
    </>
  );
}

function relativeTime(d: Date): string {
  const ms = Date.now() - d.getTime();
  const m = Math.max(1, Math.round(ms / 60e3));
  if (m < 60) return `${m}m ago`;
  const h = Math.round(ms / 3600e3);
  return `${h}h ago`;
}
