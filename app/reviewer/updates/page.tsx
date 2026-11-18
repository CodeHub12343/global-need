'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Check, X, Edit2 } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Pill, StatusPill } from '@/components/ui/Pill';
import { reviewerApi } from '@/lib/reviewer-api';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 20px;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const List = styled.aside`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  overflow: hidden;
  h3 { padding: 14px 16px; margin: 0; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; font-family: ${({ theme }) => theme.fonts.serif}; font-size: 15px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
`;
const Row = styled.div<{ $active?: boolean }>`
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  background: ${({ $active, theme }) => ($active ? theme.colors.primary50 : '#fff')};
  box-shadow: ${({ $active, theme }) => ($active ? `inset 3px 0 0 ${theme.colors.primary}` : 'none')};
  &:hover { background: ${({ $active }) => ($active ? '#ECFDF5' : '#FAFBFC')}; }
  .t { font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; line-height: 1.3; }
  .s { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 4px; }
  .m { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
`;
const Detail = styled.section`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 24px;
  h2 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 20px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 6px; }
  .meta { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-bottom: 14px; display: flex; gap: 12px; flex-wrap: wrap; }
  p.body { font-size: 14px; color: ${({ theme }) => theme.colors.text}; line-height: 1.65; white-space: pre-wrap; margin: 12px 0 18px; }
  label { font-size: 12px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin-top: 10px; display: block; }
  textarea { width: 100%; padding: 10px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; border-radius: 9px; font-size: 13px; font-family: inherit; min-height: 90px; resize: vertical; margin-top: 4px; }
  .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
`;
const Banner = styled.div<{ $tone: 'success' | 'error' }>`
  padding: 10px 12px; border-radius: 9px; font-size: 13px; margin-bottom: 10px;
  background: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success50 : theme.colors.error50)};
  color: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
  border: 1px solid ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
`;

export default function ReviewerUpdatesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: 'success' | 'error'; m: string } | null>(null);

  async function reload() {
    const d = await reviewerApi.queue({ subject: 'update', status: 'pending', limit: 50 });
    setItems(d.items);
    if (!activeId && d.items[0]) setActiveId(d.items[0].id);
  }
  useEffect(() => { reload(); }, []);

  useEffect(() => {
    if (!activeId) return;
    setDetail(null);
    reviewerApi.update.get(activeId).then(setDetail).catch((e: any) => setMsg({ t: 'error', m: e.message }));
    setReason(''); setInternalNotes('');
  }, [activeId]);

  async function decide(action: 'approve' | 'changes' | 'reject') {
    if (!activeId || busy) return;
    if (action !== 'approve' && reason.trim().length < 4) {
      setMsg({ t: 'error', m: 'Please write a reason (at least 4 characters) before requesting changes or rejecting.' });
      return;
    }
    setBusy(true); setMsg(null);
    try {
      await reviewerApi.update.decide(activeId, { action, reason, internalNotes });
      setMsg({ t: 'success', m: `Update ${action === 'approve' ? 'approved' : action === 'changes' ? 'returned for changes' : 'rejected'}.` });
      setItems((xs) => xs.filter((x) => x.id !== activeId));
      setActiveId(null);
      setDetail(null);
      reload();
    } catch (err: any) {
      setMsg({ t: 'error', m: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SessionTopbar fallbackName="Reviewer" fallbackInitial="R" fallbackRole="Reviewer · Senior" />
      <Crumbs>Reviewer › Progress updates</Crumbs>
      <PageTitle>
        <div>
          <H1>Progress update review</H1>
          <Muted>Approve, request changes, or reject progress updates submitted on approved causes.</Muted>
        </div>
      </PageTitle>

      <Grid>
        <List>
          <h3>Pending updates ({items.length})</h3>
          {items.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: '#64748B', fontSize: 13 }}>Nothing pending.</div>}
          {items.map((u) => (
            <Row key={u.id} $active={u.id === activeId} onClick={() => setActiveId(u.id)}>
              <div className="t">{u.title}</div>
              <div className="s">{u.organization?.name} · {u.cause?.title}</div>
              <div className="m">
                <Pill $tone={(u.ageHours ?? 0) >= 48 ? 'error' : (u.ageHours ?? 0) >= 24 ? 'warning' : 'info'}>
                  {u.ageHours != null ? `${u.ageHours}h` : '—'}
                </Pill>
                <StatusPill status={u.status} />
              </div>
            </Row>
          ))}
        </List>

        <Detail>
          {detail ? (
            <>
              <h2>{detail.update.title}</h2>
              <div className="meta">
                <span>{detail.organization?.name}</span>
                {detail.cause && (
                  <span>· <Link href={`/causes/${detail.cause.slug}`} target="_blank" style={{ color: '#115E59', fontWeight: 600 }}>{detail.cause.title}</Link></span>
                )}
                {detail.update.submittedAt && <span>· Submitted {new Date(detail.update.submittedAt).toLocaleString()}</span>}
                {detail.author && <span>· by {detail.author.name}</span>}
              </div>
              <p className="body">{detail.update.body}</p>

              {msg && <Banner $tone={msg.t}>{msg.m}</Banner>}

              <label>Reason / message to organization</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Required when requesting changes or rejecting." />
              <label>Internal notes (reviewer-only)</label>
              <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Optional notes to other reviewers." />
              <div className="actions">
                <Button $variant="success" $size="md" disabled={busy} onClick={() => decide('approve')}><Check size={14} />Approve</Button>
                <Button $variant="warning" $size="md" disabled={busy} onClick={() => decide('changes')}><Edit2 size={14} />Request changes</Button>
              </div>
              <Button $variant="danger" $size="md" $block disabled={busy} onClick={() => decide('reject')} style={{ marginTop: 8 }}><X size={14} />Reject</Button>

              {detail.history.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Prior reviews</div>
                  {detail.history.map((h: any) => (
                    <div key={h.id} style={{ padding: '8px 0', borderBottom: '1px solid #E5E7EB', fontSize: 13 }}>
                      <strong>{h.reviewer?.name}</strong> {h.action} · {new Date(h.createdAt).toLocaleString()}
                      {h.reason && <div style={{ color: '#475569', marginTop: 4 }}>{h.reason}</div>}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Select an update on the left to review.</div>
          )}
        </Detail>
      </Grid>
    </>
  );
}
