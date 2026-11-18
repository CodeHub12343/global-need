'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Plus, Edit2, Trash2, Send, X } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/Pill';
import { Field, Label, Input, Select, Textarea } from '@/components/ui/Form';
import { dashApi } from '@/lib/dashboard-api';

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 18px;
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
  .tc { background: ${({ $active, theme }) => ($active ? theme.colors.primary100 : theme.colors.bgSoft)}; color: ${({ $active, theme }) => ($active ? theme.colors.primary800 : theme.colors.muted)}; padding: 1px 7px; border-radius: 999px; font-size: 11px; font-weight: 700; margin-left: 6px; }
`;
const Cards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const U = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  .hd { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .cause { font-size: 11px; font-weight: 700; color: ${({ theme }) => theme.colors.primary}; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; }
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 17px; color: ${({ theme }) => theme.colors.ink}; margin: 0; line-height: 1.3; font-weight: 600; }
  p { font-size: 13px; color: ${({ theme }) => theme.colors.text}; margin: 0; line-height: 1.55; }
  .fb { background: #FFFBEB; border: 1px solid #FDE68A; color: ${({ theme }) => theme.colors.warning}; padding: 10px 12px; border-radius: 9px; font-size: 12px; line-height: 1.5; strong { display: block; color: ${({ theme }) => theme.colors.ink}; margin-bottom: 3px; } }
  .meta { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid ${({ theme }) => theme.colors.border}; font-size: 12px; color: ${({ theme }) => theme.colors.muted}; }
  .r { display: flex; gap: 6px; align-items: center; }
  .rbtn { width: 28px; height: 28px; border: 1px solid ${({ theme }) => theme.colors.border}; background: #fff; border-radius: 6px; display: grid; place-items: center; color: ${({ theme }) => theme.colors.muted}; cursor: pointer; }
  .rbtn:hover { color: ${({ theme }) => theme.colors.primary}; border-color: ${({ theme }) => theme.colors.primary}; }
`;
const Dialog = styled.div`
  position: fixed; inset: 0; background: rgba(2, 8, 23, 0.4); display: grid; place-items: center; z-index: 100; padding: 20px;
  .box { background: #fff; border-radius: 14px; width: 100%; max-width: 560px; padding: 24px; box-shadow: ${({ theme }) => theme.shadows.lg}; max-height: 90vh; overflow-y: auto; }
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 18px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 16px; display: flex; justify-content: space-between; align-items: center; .x { background: none; border: none; cursor: pointer; color: ${({ theme }) => theme.colors.muted}; } }
`;

const TABS = [
  { k: 'all', l: 'All' },
  { k: 'draft', l: 'Drafts' },
  { k: 'pending', l: 'Submitted' },
  { k: 'changes', l: 'Changes requested' },
  { k: 'approved', l: 'Approved' },
];

function rt(iso: string | null): string {
  if (!iso) return 'just now';
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.max(1, Math.round(ms / 3600e3));
  if (h < 48) return `${h}h ago`;
  const d = Math.round(ms / 86400e3);
  if (d < 14) return `${d}d ago`;
  return `${Math.round(d / 7)}w ago`;
}

export default function DashUpdatesPage() {
  const [active, setActive] = useState('all');
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [causes, setCauses] = useState<any[]>([]);
  const [form, setForm] = useState({ causeId: '', title: '', body: '' });
  const [saving, setSaving] = useState(false);

  async function reload() {
    setLoading(true);
    try {
      const data = await dashApi.updates.list({ status: active });
      setItems(data.items);
      setCounts(data.counts || {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { reload(); }, [active]);

  async function openNew() {
    setEditing(null);
    setForm({ causeId: '', title: '', body: '' });
    setEditorOpen(true);
    try {
      const data = await dashApi.causes.list({ status: 'approved', limit: 50 });
      setCauses(data.items);
      if (data.items[0]) setForm((f) => ({ ...f, causeId: data.items[0].id }));
    } catch {}
  }
  function openEdit(u: any) {
    setEditing(u);
    setForm({ causeId: u.causeId, title: u.title, body: u.body });
    setEditorOpen(true);
  }

  async function save(submit: boolean) {
    setSaving(true);
    try {
      let id: string;
      if (editing) {
        await dashApi.updates.patch(editing.id, { title: form.title, body: form.body });
        id = editing.id;
      } else {
        const data = await dashApi.updates.create(form);
        id = data.id;
      }
      if (submit) await dashApi.updates.submit(id);
      setEditorOpen(false);
      reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this draft?')) return;
    try { await dashApi.updates.remove(id); reload(); } catch (err: any) { alert(err.message); }
  }

  return (
    <>
      <SessionTopbar fallbackName="Organization" fallbackInitial="O" fallbackRole="Organization" showOrgInsteadOfRole />
      <Crumbs>Dashboard › Progress updates</Crumbs>
      <PageTitle>
        <div>
          <H1>Progress updates</H1>
          <Muted>Share what's happening on your approved causes. Every update is reviewed before it reaches the public site.</Muted>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button $variant="primary" $size="md" onClick={openNew}><Plus size={13} />New update</Button>
        </div>
      </PageTitle>

      <Tabs>
        {TABS.map((t) => (
          <Tab key={t.k} $active={active === t.k} onClick={() => setActive(t.k)}>
            {t.l}<span className="tc">{counts[t.k] ?? 0}</span>
          </Tab>
        ))}
      </Tabs>

      {error && <div style={{ padding: 16, color: '#B91C1C' }}>{error}</div>}
      {loading && items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading updates…</div>
      ) : items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No updates here yet.</div>
      ) : (
        <Cards>
          {items.map((u) => (
            <U key={u.id}>
              <div className="hd">
                <div>
                  <div className="cause">{u.causeTitle}</div>
                  <h3>{u.title}</h3>
                </div>
                <StatusPill status={u.status} />
              </div>
              <p>{u.body}</p>
              {u.reviewerFeedback && u.status === 'changes' && (
                <div className="fb">
                  <strong>Reviewer note</strong>
                  {u.reviewerFeedback}
                </div>
              )}
              <div className="meta">
                <span>
                  {u.status === 'approved' && u.approvedAt ? `Published ${rt(u.approvedAt)}` :
                   u.status === 'pending' && u.submittedAt ? `Submitted ${rt(u.submittedAt)}` :
                   u.status === 'changes' ? `Changes requested ${rt(u.updatedAt)}` :
                   `Last edited ${rt(u.updatedAt)}`}
                </span>
                <div className="r">
                  {(u.status === 'draft' || u.status === 'changes') && (
                    <>
                      <button className="rbtn" aria-label="Edit" onClick={() => openEdit(u)}><Edit2 size={13} /></button>
                      <button className="rbtn" aria-label="Submit" onClick={async () => { try { await dashApi.updates.submit(u.id); reload(); } catch (e: any) { alert(e.message); } }}><Send size={13} /></button>
                    </>
                  )}
                  {u.status === 'draft' && (
                    <button className="rbtn" aria-label="Delete" onClick={() => remove(u.id)}><Trash2 size={13} /></button>
                  )}
                </div>
              </div>
            </U>
          ))}
        </Cards>
      )}

      {editorOpen && (
        <Dialog onClick={(e) => { if (e.target === e.currentTarget) setEditorOpen(false); }}>
          <div className="box">
            <h3>{editing ? 'Edit update' : 'New progress update'}<button className="x" onClick={() => setEditorOpen(false)}><X size={18} /></button></h3>
            {!editing && (
              <Field>
                <Label>Cause *</Label>
                <Select value={form.causeId} onChange={(e) => setForm({ ...form, causeId: e.target.value })}>
                  {causes.length === 0 && <option value="">No approved causes yet</option>}
                  {causes.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </Select>
              </Field>
            )}
            <Field><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field><Label>Body</Label><Textarea rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button $variant="ghost" $size="md" onClick={() => setEditorOpen(false)}>Cancel</Button>
              <Button $variant="ghost" $size="md" onClick={() => save(false)} disabled={saving || !form.title}>Save draft</Button>
              <Button $variant="primary" $size="md" onClick={() => save(true)} disabled={saving || !form.title || !form.body || !form.causeId}>
                {saving ? 'Saving…' : 'Submit for review'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
