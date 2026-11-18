'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { MapPin, Check, X, Edit2, Lock, FileText, Image as ImageIcon, UserPlus } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs } from '@/components/layout/Topbar';
import { H1 } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Pill, StatusPill } from '@/components/ui/Pill';
import { CATEGORY_LABEL } from '@/lib/mock-data';
import { reviewerApi } from '@/lib/reviewer-api';

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 20px;
  flex-wrap: wrap;
  .meta { display: flex; gap: 16px; color: ${({ theme }) => theme.colors.muted}; font-size: 13px; flex-wrap: wrap; align-items: center; margin-top: 10px; }
  .meta span { display: inline-flex; align-items: center; gap: 4px; }
`;
const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Tabs = styled.div`
  display: flex;
  gap: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 20px;
  overflow-x: auto;
`;
const Tab = styled.button<{ $active?: boolean }>`
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary700 : theme.colors.muted)};
  border: none;
  border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary700 : 'transparent')};
  background: none;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
`;
const Panel = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 22px;
  margin-bottom: 16px;
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 17px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 4px; font-weight: 600; }
  .ps { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-bottom: 14px; }
`;
const Kv = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 13px;
  &:last-of-type { border-bottom: none; }
  .k { color: ${({ theme }) => theme.colors.muted}; font-weight: 500; }
  .v { color: ${({ theme }) => theme.colors.ink}; }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; }
`;
const Prose = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.65;
  p { margin: 0 0 10px; }
`;
const PrivateWarn = styled.div`
  background: ${({ theme }) => theme.colors.warning50};
  border: 1px solid #fbbf24;
  color: ${({ theme }) => theme.colors.warning};
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
`;
const Docs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 4px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { grid-template-columns: 1fr; }
`;
const Doc = styled.div`
  display: flex;
  gap: 10px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: #FAFBFC;
  align-items: center;
  .di { width: 36px; height: 36px; border-radius: 8px; background: ${({ theme }) => theme.colors.error50}; color: ${({ theme }) => theme.colors.error}; display: grid; place-items: center; flex-shrink: 0; font-size: 11px; font-weight: 700; }
  .dn { font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; line-height: 1.3; }
  .ds { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
`;
const Decision = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 22px;
  position: sticky;
  top: 20px;
  .dec-head { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 17px; color: ${({ theme }) => theme.colors.ink}; margin-bottom: 4px; font-weight: 600; }
  .dec-sub { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-bottom: 14px; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
  label { font-size: 12px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin: 10px 0 5px; display: block; }
  textarea { width: 100%; padding: 10px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; border-radius: 9px; font-size: 13px; font-family: inherit; min-height: 80px; resize: vertical; }
  select { width: 100%; padding: 8px 10px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; border-radius: 8px; font-size: 13px; background: #fff; font-family: inherit; }
`;
const Check2 = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
  input { accent-color: ${({ theme }) => theme.colors.primary}; margin-top: 3px; }
  .t { font-size: 13px; color: ${({ theme }) => theme.colors.ink}; font-weight: 500; }
  .s { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
`;
const Banner = styled.div<{ $tone: 'success' | 'error' }>`
  padding: 10px 12px;
  border-radius: 9px;
  font-size: 13px;
  margin-bottom: 10px;
  background: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success50 : theme.colors.error50)};
  color: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
  border: 1px solid ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
`;

const CHECKLIST = [
  { key: 'org_verified', label: 'Organization previously verified' },
  { key: 'privacy', label: 'Submission respects beneficiary privacy' },
  { key: 'intended_use', label: 'Clear intended use of support' },
  { key: 'docs_align', label: 'Supporting docs align with claims' },
  { key: 'consent', label: 'Photography has consent documentation' },
  { key: 'language', label: 'Language is dignified & appropriate' },
];

function rt(iso: string | null): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.max(0, Math.round(ms / 3600e3));
  if (h < 48) return `${h}h ago`;
  const d = Math.round(ms / 86400e3);
  return `${d}d ago`;
}

export default function ReviewerSubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<'sub' | 'org' | 'docs' | 'hist'>('sub');
  const [reviewers, setReviewers] = useState<any[]>([]);

  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => Object.fromEntries(CHECKLIST.map((c) => [c.key, false])));
  const [reason, setReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [assignTo, setAssignTo] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: 'success' | 'error'; m: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    reviewerApi.submission.get(id).then((d) => {
      setData(d);
      setAssignTo(d.assignedReviewer?.id || '');
    }).catch((err: any) => setMsg({ t: 'error', m: err.message }));
    reviewerApi.reviewers().then(setReviewers).catch(() => {});
  }, [id]);

  async function decide(action: 'approve' | 'changes' | 'reject') {
    if (!id || busy) return;
    if (action !== 'approve' && reason.trim().length < 4) {
      setMsg({ t: 'error', m: 'Please write a reason (at least 4 characters) before requesting changes or rejecting.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const checklistArr = CHECKLIST.map((c) => ({ key: c.key, label: c.label, checked: !!checklist[c.key] }));
      await reviewerApi.submission.decide(id, { action, reason, internalNotes, checklist: checklistArr });
      setMsg({ t: 'success', m: `Submission ${action === 'approve' ? 'approved' : action === 'changes' ? 'returned for changes' : 'rejected'}.` });
      setTimeout(() => router.push('/reviewer/submissions'), 1000);
    } catch (err: any) {
      setMsg({ t: 'error', m: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function changeAssign(nextId: string) {
    if (!id) return;
    setAssignTo(nextId);
    try {
      await reviewerApi.submission.assign(id, nextId || null);
      setMsg({ t: 'success', m: nextId ? 'Assigned.' : 'Unassigned.' });
    } catch (err: any) {
      setMsg({ t: 'error', m: err.message });
    }
  }

  if (!data) {
    return <div style={{ padding: 60, textAlign: 'center', color: '#64748B' }}>Loading submission…</div>;
  }
  const { cause, organization: org, documents, submittedBy, history } = data;
  const catLabel = (CATEGORY_LABEL as any)[cause.category] || cause.category;

  return (
    <>
      <SessionTopbar fallbackName="Reviewer" fallbackInitial="R" fallbackRole="Reviewer" />
      <Crumbs><a href="/reviewer/submissions">Submission queue</a> › <strong>{cause.title}</strong></Crumbs>

      <Head>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <Pill $tone="primary" style={{ textTransform: 'uppercase' }}>{catLabel}</Pill>
            <StatusPill status={cause.status} />
            <span style={{ fontSize: 12, color: '#64748B' }}>{cause.publicId || `Draft ${cause.id.slice(-6)}`}</span>
          </div>
          <H1>{cause.title}</H1>
          <div className="meta">
            {org && <span>{org.name}</span>}
            {cause.country && <span><MapPin size={14} />{cause.city}{cause.city && cause.country ? ', ' : ''}{cause.country}</span>}
            {cause.submittedAt && <span>Submitted {rt(cause.submittedAt)}{submittedBy ? ` · ${submittedBy.name}` : ''}</span>}
          </div>
        </div>
      </Head>

      <Layout>
        <div>
          <Tabs>
            <Tab $active={tab === 'sub'} onClick={() => setTab('sub')}>Submission</Tab>
            <Tab $active={tab === 'org'} onClick={() => setTab('org')}>Organization</Tab>
            <Tab $active={tab === 'docs'} onClick={() => setTab('docs')}>Supporting documents ({documents.length})</Tab>
            <Tab $active={tab === 'hist'} onClick={() => setTab('hist')}>History ({history.length})</Tab>
          </Tabs>

          {tab === 'sub' && (
            <>
              <Panel>
                <h3>Public-facing content</h3>
                <div className="ps">This information will appear on the cause's public page if approved.</div>
                <Kv><span className="k">Title</span><span className="v">{cause.title}</span></Kv>
                <Kv><span className="k">Short description</span><span className="v">{cause.shortDescription || '—'}</span></Kv>
                <Kv><span className="k">Category</span><span className="v">{catLabel}</span></Kv>
                <Kv><span className="k">Location</span><span className="v">{[cause.city, cause.country].filter(Boolean).join(', ') || '—'}</span></Kv>
                <Kv><span className="k">Primary assistance</span><span className="v">{cause.primaryAssistance || '—'}</span></Kv>
                <Kv><span className="k">Timeline</span><span className="v">{cause.timeline || '—'}</span></Kv>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Detailed story</div>
                  <Prose><p>{cause.story || '—'}</p></Prose>
                </div>
              </Panel>
              <Panel>
                <h3>Humanitarian need &amp; intended use</h3>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Need</div>
                <Prose><p>{cause.need || '—'}</p></Prose>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 12, marginBottom: 6 }}>Who it supports</div>
                <Prose><p>{cause.whoItSupports || '—'}</p></Prose>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 12, marginBottom: 6 }}>Intended use</div>
                <Prose><p>{cause.intendedUse || '—'}</p></Prose>
                {cause.whyNow && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 12, marginBottom: 6 }}>Why now</div>
                    <Prose><p>{cause.whyNow}</p></Prose>
                  </>
                )}
              </Panel>
            </>
          )}

          {tab === 'org' && (
            <Panel>
              <h3>Organization</h3>
              {org ? (
                <>
                  <Kv><span className="k">Name</span><span className="v">{org.name}</span></Kv>
                  <Kv><span className="k">Status</span><span className="v"><Pill $tone={org.verified ? 'success' : 'warning'}>{org.verified ? 'Verified' : 'Pending'}</Pill></span></Kv>
                  <Kv><span className="k">Category</span><span className="v">{(CATEGORY_LABEL as any)[org.category] || org.category}</span></Kv>
                  <Kv><span className="k">Location</span><span className="v">{org.location}</span></Kv>
                  <Kv><span className="k">Operating since</span><span className="v">{org.operatingSince || '—'}</span></Kv>
                  <Kv><span className="k">Public email</span><span className="v">{org.publicEmail || '—'}</span></Kv>
                  <Kv><span className="k">Website</span><span className="v">{org.website || '—'}</span></Kv>
                  <Kv><span className="k">Verification checks</span><span className="v">{org.checksPassed} of {org.checksTotal} passed</span></Kv>
                </>
              ) : <div className="ps">Organization not found.</div>}
            </Panel>
          )}

          {tab === 'docs' && (
            <Panel>
              <h3>Supporting documentation</h3>
              <div className="ps">Private material — visible only to authorized reviewers.</div>
              <PrivateWarn>
                <Lock size={14} />
                <div>Private documents. Do not export, download or share outside the review process.</div>
              </PrivateWarn>
              {documents.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#64748B', fontSize: 13 }}>No documents attached.</div>
              ) : (
                <Docs>
                  {documents.map((d: any) => (
                    <Doc key={d.id}>
                      <div className="di">{(d.mimeType || '').includes('image') ? <ImageIcon size={16} /> : 'PDF'}</div>
                      <div style={{ flexGrow: 1 }}>
                        <div className="dn">{d.originalName}</div>
                        <div className="ds">{(d.size / 1024).toFixed(0)} KB · {d.type}</div>
                      </div>
                    </Doc>
                  ))}
                </Docs>
              )}
            </Panel>
          )}

          {tab === 'hist' && (
            <Panel>
              <h3>Review history</h3>
              {history.length === 0 ? <div className="ps">No prior reviews.</div> : (
                <div>
                  {history.map((h: any) => (
                    <div key={h.id} style={{ padding: '12px 0', borderBottom: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1F2A', display: 'flex', gap: 10, alignItems: 'center' }}>
                        <StatusPill status={h.action === 'approve' ? 'approved' : h.action === 'changes' ? 'changes' : h.action === 'reject' ? 'rejected' : 'pending' as any} />
                        {h.reviewer?.name || 'Reviewer'} · {rt(h.createdAt)}
                      </div>
                      {h.reason && <div style={{ fontSize: 13, color: '#334155', marginTop: 6 }}>{h.reason}</div>}
                      {h.internalNotes && <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, fontStyle: 'italic' }}>Internal: {h.internalNotes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}
        </div>

        <aside>
          <Panel>
            <h3>Assignment</h3>
            <div className="ps">Who's handling this review.</div>
            <select
              value={assignTo}
              onChange={(e) => changeAssign(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, background: '#fff', fontFamily: 'inherit' }}
            >
              <option value="">Unassigned</option>
              {reviewers.map((r) => <option key={r.id} value={r.id}>{r.name} · {r.role.replace('_', ' ')}</option>)}
            </select>
          </Panel>

          <Panel>
            <h3>Review checklist</h3>
            <div className="ps">Confirm each item before completing the review.</div>
            {CHECKLIST.map((c) => (
              <Check2 key={c.key}>
                <input
                  type="checkbox"
                  checked={!!checklist[c.key]}
                  onChange={(e) => setChecklist((x) => ({ ...x, [c.key]: e.target.checked }))}
                />
                <div><div className="t">{c.label}</div></div>
              </Check2>
            ))}
          </Panel>
          <Panel>
            <h3>Internal reviewer notes</h3>
            <div className="ps">Visible only to reviewers and administrators.</div>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              style={{ width: '100%', padding: 12, border: '1px solid #CBD5E1', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', minHeight: 100, resize: 'vertical' }}
            />
          </Panel>

          <Decision>
            <div className="dec-head">Decision</div>
            <div className="dec-sub">Choose one. A reason is required for anything except approval.</div>
            {msg && <Banner $tone={msg.t}>{msg.m}</Banner>}
            <div className="row">
              <Button $variant="success" $size="md" disabled={busy} onClick={() => decide('approve')}><Check size={14} />Approve</Button>
              <Button $variant="warning" $size="md" disabled={busy} onClick={() => decide('changes')}><Edit2 size={14} />Request changes</Button>
            </div>
            <Button $variant="danger" $size="md" $block disabled={busy} onClick={() => decide('reject')}><X size={14} />Reject submission</Button>
            <label>Reason / message to organization</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="This will be shared with the organization representative."
            />
          </Decision>
        </aside>
      </Layout>
    </>
  );
}
