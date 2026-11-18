'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Upload, Trash2, Lock } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Field, Label, Input, Select } from '@/components/ui/Form';
import { dashApi } from '@/lib/dashboard-api';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const Card = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 22px;
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
  .ic { width: 38px; height: 38px; border-radius: 9px; background: ${({ theme }) => theme.colors.bg}; color: ${({ theme }) => theme.colors.muted}; display: grid; place-items: center; }
  .n { font-weight: 600; font-size: 13px; color: ${({ theme }) => theme.colors.ink}; }
  .m { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; display: flex; gap: 10px; }
  .r { margin-left: auto; display: flex; gap: 6px; }
  .r button { border: 1px solid ${({ theme }) => theme.colors.border}; background: #fff; border-radius: 7px; padding: 6px; cursor: pointer; color: ${({ theme }) => theme.colors.muted}; }
`;
const Banner = styled.div<{ $tone: 'success' | 'error' }>`
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 12px;
  background: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success50 : theme.colors.error50)};
  color: ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
  border: 1px solid ${({ $tone, theme }) => ($tone === 'success' ? theme.colors.success : theme.colors.error)};
`;

const TYPE_LABELS: Record<string, string> = {
  registration: 'Registration',
  governance: 'Governance',
  operating_budget: 'Budget',
  reference: 'Reference',
  photos: 'Photos',
  consent_log: 'Consent log',
  other: 'Other',
};

function prettySize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ originalName: '', size: '', mimeType: 'application/pdf', type: 'registration', url: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ t: 'success' | 'error'; m: string } | null>(null);

  async function reload() {
    setLoading(true);
    try { setDocs(await dashApi.documents.list()); } finally { setLoading(false); }
  }
  useEffect(() => { reload(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await dashApi.documents.create({
        originalName: form.originalName,
        filename: form.originalName,
        size: parseInt(form.size, 10) || 0,
        mimeType: form.mimeType,
        type: form.type,
        url: form.url,
      });
      setForm({ originalName: '', size: '', mimeType: 'application/pdf', type: 'registration', url: '' });
      setMsg({ t: 'success', m: 'Document record added.' });
      reload();
    } catch (err: any) {
      setMsg({ t: 'error', m: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this document record?')) return;
    try { await dashApi.documents.remove(id); reload(); } catch (err: any) { alert(err.message); }
  }

  return (
    <>
      <SessionTopbar fallbackName="Organization" fallbackInitial="O" fallbackRole="Organization" showOrgInsteadOfRole />
      <Crumbs>Dashboard › Documents</Crumbs>
      <PageTitle>
        <div>
          <H1>Private documents</H1>
          <Muted>Documents stay private — reviewers can see them, the public never does. File storage is wired to your choice of backend in a later phase; records are tracked here.</Muted>
        </div>
      </PageTitle>

      <Grid>
        <Card>
          {loading && docs.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: '#64748B' }}>Loading…</div>
          ) : docs.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: '#64748B' }}>No documents yet.</div>
          ) : docs.map((d) => (
            <Row key={d.id}>
              <div className="ic"><Lock size={16} /></div>
              <div>
                <div className="n">{d.originalName}</div>
                <div className="m">
                  <span>{TYPE_LABELS[d.type] || d.type}</span>
                  <span>{prettySize(d.size)}</span>
                  <span>{d.mimeType}</span>
                </div>
              </div>
              <div className="r">
                <button aria-label="Delete" onClick={() => remove(d.id)}><Trash2 size={14} /></button>
              </div>
            </Row>
          ))}
        </Card>

        <Card as="form" onSubmit={add}>
          <h3 style={{ fontFamily: 'Lora, serif', fontSize: 16, margin: '0 0 14px', fontWeight: 600 }}>Add document record</h3>
          {msg && <Banner $tone={msg.t}>{msg.m}</Banner>}
          <Field><Label>File name</Label><Input required value={form.originalName} onChange={(e) => setForm({ ...form, originalName: e.target.value })} placeholder="registration-certificate.pdf" /></Field>
          <Field>
            <Label>Type</Label>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </Select>
          </Field>
          <Field><Label>Size in bytes</Label><Input required type="number" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="102400" /></Field>
          <Field><Label>MIME type</Label><Input value={form.mimeType} onChange={(e) => setForm({ ...form, mimeType: e.target.value })} /></Field>
          <Field><Label>Reference URL (optional)</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" /></Field>
          <Button type="submit" $variant="primary" $size="md" $block disabled={saving}>
            <Upload size={13} />{saving ? 'Saving…' : 'Add record'}
          </Button>
        </Card>
      </Grid>
    </>
  );
}
