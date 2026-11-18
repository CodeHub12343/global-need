'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Lock, MapPin, Check, X, Edit2, Image as ImageIcon } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { adminApi } from '@/lib/admin-api';

const Banner = styled.div`
  background: linear-gradient(90deg, rgba(185,28,28,.06), rgba(180,83,9,.06));
  border: 1px solid #fecaca; border-radius: 12px; padding: 14px 18px;
  display: flex; gap: 14px; align-items: center; margin-bottom: 22px;
  svg { color: ${({ theme }) => theme.colors.error}; flex-shrink: 0; }
  .t { font-weight: 700; color: ${({ theme }) => theme.colors.ink}; font-size: 14px; }
  .s { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
`;
const Layout = styled.div`
  display: grid; grid-template-columns: 280px 1fr 320px; gap: 20px; align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.breakpoints.xl}) { grid-template-columns: 1fr; }
`;
const QueueCard = styled.aside` background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; overflow: hidden;
  .qh { padding: 14px 16px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; display: flex; justify-content: space-between; align-items: center; }
  .qh h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 15px; margin: 0; font-weight: 600; }
  .qh .c { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; background: ${({ theme }) => theme.colors.bg}; padding: 2px 8px; border-radius: 999px; font-weight: 700; }
`;
const QItem = styled.div<{ $active?: boolean }>`
  padding: 14px 16px; display: flex; gap: 12px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; cursor: pointer;
  background: ${({ $active, theme }) => ($active ? theme.colors.primary50 : '#fff')};
  box-shadow: ${({ $active, theme }) => ($active ? `inset 3px 0 0 ${theme.colors.primary}` : 'none')};
  &:last-child { border-bottom: none; }
  .logo { width: 38px; height: 38px; border-radius: 9px; color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 15px; font-family: ${({ theme }) => theme.fonts.serif}; flex-shrink: 0; }
  .n { font-size: 13px; font-weight: 700; color: ${({ theme }) => theme.colors.ink}; }
  .m { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; }
  .d { font-size: 11px; color: ${({ theme }) => theme.colors.warning}; font-weight: 600; margin-top: 4px; }
`;
const Center = styled.section` background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; overflow: hidden; `;
const CenterHead = styled.div`
  padding: 22px 24px; border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  h2 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 22px; margin: 0 0 6px; font-weight: 600; }
  .m { font-size: 13px; color: ${({ theme }) => theme.colors.muted}; display: flex; gap: 14px; flex-wrap: wrap; }
`;
const CenterBody = styled.div` padding: 24px; `;
const OvGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px;
  .item { background: ${({ theme }) => theme.colors.bg}; border-radius: 10px; padding: 14px; }
  .l { font-size: 11px; font-weight: 700; color: ${({ theme }) => theme.colors.muted}; text-transform: uppercase; letter-spacing: 0.06em; }
  .v { font-size: 14px; color: ${({ theme }) => theme.colors.ink}; font-weight: 500; margin-top: 4px; }
`;
const SecT = styled.h4` font-family: ${({ theme }) => theme.fonts.serif}; font-size: 16px; margin: 8px 0 10px; font-weight: 600; `;
const DocsList = styled.div`
  display: flex; flex-direction: column; gap: 10px;
  .doc { display: flex; gap: 12px; padding: 14px; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 10px; align-items: center; background: #FAFBFC; }
  .di { width: 40px; height: 40px; border-radius: 9px; display: grid; place-items: center; flex-shrink: 0; font-size: 10px; font-weight: 700; background: ${({ theme }) => theme.colors.primary50}; color: ${({ theme }) => theme.colors.primary}; }
  .dn { font-size: 13px; font-weight: 600; }
  .ds { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 3px; }
  .pr { background: ${({ theme }) => theme.colors.error50}; color: ${({ theme }) => theme.colors.error}; padding: 1px 7px; border-radius: 999px; font-weight: 600; margin-right: 6px; }
`;
const Rail = styled.aside` display: flex; flex-direction: column; gap: 14px; `;
const RCard = styled.div` background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; padding: 18px;
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 15px; margin: 0 0 4px; font-weight: 600; }
  .ps { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-bottom: 12px; }
`;
const Banner2 = styled.div<{ $tone: 'success' | 'error' }>`
  padding: 10px 12px; border-radius: 9px; font-size: 13px; margin: 8px 0;
  background: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success50 : theme.colors.error50)};
  color: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
  border: 1px solid ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
`;

const CHECKLIST_ITEMS = [
  { key: 'registration', label: 'Registration certificate authenticity' },
  { key: 'governance', label: 'Governance records present' },
  { key: 'mission', label: 'Mission alignment with category' },
  { key: 'reference', label: 'Reference verified independently' },
  { key: 'photos', label: 'Photos cleared for consent' },
  { key: 'beneficiary', label: 'No identifying info of beneficiaries in public statement' },
];

export default function AdminVerificationPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<{ t: 'success' | 'error'; m: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function reload() {
    const d = await adminApi.verification.queue();
    setQueue(d.items);
    if (!activeId && d.items[0]) setActiveId(d.items[0].id);
  }
  useEffect(() => { reload(); }, []);

  useEffect(() => {
    if (!activeId) return;
    setDetail(null);
    adminApi.verification.get(activeId).then(setDetail).catch((e: any) => setMsg({ t: 'error', m: e.message }));
    setReason(''); setInternalNotes(''); setChecklist({});
  }, [activeId]);

  async function decide(action: 'verify' | 'request_info' | 'reject') {
    if (!activeId || busy) return;
    if (action !== 'verify' && reason.trim().length < 4) {
      setMsg({ t: 'error', m: 'Please write a reason (at least 4 characters).' });
      return;
    }
    setBusy(true); setMsg(null);
    try {
      const checklistArr = CHECKLIST_ITEMS.map((c) => ({ key: c.key, label: c.label, checked: !!checklist[c.key] }));
      await adminApi.verification.decide(activeId, { action, reason, internalNotes, checklist: checklistArr });
      setMsg({ t: 'success', m: `Organization ${action === 'verify' ? 'verified' : action === 'reject' ? 'rejected' : 'returned for info'}.` });
      setQueue((xs) => xs.filter((x) => x.id !== activeId));
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
      <SessionTopbar fallbackName="Admin" fallbackInitial="A" fallbackRole="Super admin" />
      <Crumbs>Admin › Verification center</Crumbs>
      <PageTitle>
        <div>
          <H1>Verification center</H1>
          <Muted>Inspect supporting evidence for organizations awaiting verification. Private material — handle with care.</Muted>
        </div>
      </PageTitle>

      <Banner>
        <Lock size={22} />
        <div>
          <div className="t">Private verification records</div>
          <div className="s">Documents here include identity and registration evidence. Do not share outside the verification process. All activity is logged.</div>
        </div>
      </Banner>

      <Layout>
        <QueueCard>
          <div className="qh"><h3>Awaiting verification</h3><span className="c">{queue.length}</span></div>
          {queue.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: '#64748B', fontSize: 13 }}>None pending.</div>}
          {queue.map((q) => (
            <QItem key={q.id} $active={q.id === activeId} onClick={() => setActiveId(q.id)}>
              <div className="logo" style={{ background: q.gradient }}>{q.initial}</div>
              <div>
                <div className="n">{q.name}</div>
                <div className="m">{q.category || '—'} · {q.country || ''}</div>
                <div className="d">â— {q.daysWaiting} day{q.daysWaiting !== 1 ? 's' : ''} waiting</div>
              </div>
            </QItem>
          ))}
        </QueueCard>

        <Center>
          {detail ? (
            <>
              <CenterHead>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <Pill $tone="warning">Awaiting verification</Pill>
                  <Pill $tone="error"><Lock size={10} />Private records</Pill>
                </div>
                <h2>{detail.organization.name}</h2>
                <div className="m">
                  <span><MapPin size={13} />{[detail.organization.city, detail.organization.country].filter(Boolean).join(', ') || 'Location —'}</span>
                  <span>Submitted {detail.organization.daysWaiting} days ago</span>
                  {detail.contact && <span>Point of contact: {detail.contact.name}</span>}
                </div>
              </CenterHead>
              <CenterBody>
                <OvGrid>
                  <div className="item"><div className="l">Organization type</div><div className="v">{detail.organization.type}</div></div>
                  <div className="item"><div className="l">Primary category</div><div className="v" style={{ textTransform: 'capitalize' }}>{detail.organization.category?.replace('-', ' ') || '—'}</div></div>
                  <div className="item"><div className="l">Operating since</div><div className="v">{detail.organization.operatingSince || '—'}</div></div>
                  <div className="item"><div className="l">Public contact email</div><div className="v">{detail.organization.publicEmail || '—'}</div></div>
                </OvGrid>

                <SecT>Submitted supporting documents ({detail.documents.length})</SecT>
                <DocsList>
                  {detail.documents.length === 0 && <div style={{ color: '#64748B', fontSize: 13 }}>No documents uploaded.</div>}
                  {detail.documents.map((d: any) => (
                    <div className="doc" key={d.id}>
                      <div className="di">{d.mimeType?.startsWith('image') ? <ImageIcon size={16} /> : d.mimeType?.includes('pdf') ? 'PDF' : 'DOC'}</div>
                      <div>
                        <div className="dn">{d.filename}</div>
                        <div className="ds">{d.isPrivate && <span className="pr">Private</span>}{(d.size / 1024).toFixed(0)} KB · {d.type}</div>
                      </div>
                    </div>
                  ))}
                </DocsList>

                <SecT style={{ marginTop: 22 }}>Public-facing statement</SecT>
                <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 16, fontSize: 13, lineHeight: 1.6 }}>
                  {detail.organization.shortDescription || detail.organization.description || '—'}
                </div>
              </CenterBody>
            </>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Select an organization on the left.</div>
          )}
        </Center>

        <Rail>
          <RCard>
            <h3>Verification checklist</h3>
            <div className="ps">Confirm each item before completing verification.</div>
            {CHECKLIST_ITEMS.map((c) => (
              <label key={c.key} style={{ display: 'flex', gap: 9, padding: '9px 0', borderBottom: '1px solid #E5E7EB', fontSize: 13 }}>
                <input type="checkbox" checked={!!checklist[c.key]} onChange={(e) => setChecklist((p) => ({ ...p, [c.key]: e.target.checked }))} />
                <span>{c.label}</span>
              </label>
            ))}
          </RCard>
          <RCard>
            <h3>Decision</h3>
            {msg && <Banner2 $tone={msg.t}>{msg.m}</Banner2>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <Button $variant="success" $size="sm" disabled={!activeId || busy} onClick={() => decide('verify')}><Check size={13} />Verify</Button>
              <Button $variant="warning" $size="sm" disabled={!activeId || busy} onClick={() => decide('request_info')}><Edit2 size={13} />Request info</Button>
            </div>
            <Button $variant="danger" $size="sm" $block disabled={!activeId || busy} onClick={() => decide('reject')}><X size={13} />Reject application</Button>
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Decision reason / message</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #CBD5E1', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', minHeight: 70, resize: 'vertical' }} placeholder="Shared with the organization's contact." />
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', margin: '8px 0 5px' }}>Internal notes</label>
              <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #CBD5E1', borderRadius: 9, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical' }} placeholder="Optional reviewer-only notes." />
            </div>
          </RCard>
        </Rail>
      </Layout>
    </>
  );
}
