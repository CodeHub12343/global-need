'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Plus, Edit2, Check, Heart } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs, PageTitle } from '@/components/layout/Topbar';
import { H1, Muted } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Field, Label, Input, Textarea } from '@/components/ui/Form';
import { adminApi } from '@/lib/admin-api';

const Layout = styled.div`
  display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const TCard = styled.div` background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; overflow: hidden; `;
const T = styled.table`
  width: 100%; border-collapse: collapse; font-size: 13px;
  th { text-align: left; padding: 12px 16px; color: ${({ theme }) => theme.colors.muted}; font-weight: 600; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; background: ${({ theme }) => theme.colors.bg}; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
  td { padding: 14px 16px; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.ink}; }
  tr:last-child td { border-bottom: none; }
`;
const CatCell = styled.div`
  display: flex; align-items: center; gap: 12px;
  .ic { width: 38px; height: 38px; border-radius: 9px; background: ${({ theme }) => theme.colors.primary50}; color: ${({ theme }) => theme.colors.primary}; display: grid; place-items: center; flex-shrink: 0; }
  .n { font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
  .s { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-top: 2px; font-family: ui-monospace, monospace; }
`;
const Toggle = styled.span<{ $on?: boolean }>`
  position: relative; width: 38px; height: 22px;
  background: ${({ $on, theme }) => ($on ? theme.colors.primary : theme.colors.border)};
  border-radius: 999px; cursor: pointer; display: inline-block;
  &::after { content: ''; position: absolute; top: 3px; left: ${({ $on }) => ($on ? '19px' : '3px')}; width: 16px; height: 16px; background: #fff; border-radius: 999px; transition: all 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
`;
const Sc = styled.aside`
  background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; padding: 22px;
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 17px; margin: 0 0 4px; font-weight: 600; }
`;

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function reload() { setRows(await adminApi.categories.list()); }
  useEffect(() => { reload(); }, []);

  async function create() {
    setBusy(true); setErr(null);
    try {
      await adminApi.categories.create({ name, slug: slug || slugify(name), description, active });
      setName(''); setSlug(''); setDescription(''); setActive(false);
      await reload();
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function toggleActive(id: string, current: boolean) {
    await adminApi.categories.patch(id, { active: !current });
    await reload();
  }

  return (
    <>
      <SessionTopbar fallbackName="Admin" fallbackInitial="A" fallbackRole="Super admin" />
      <Crumbs>Admin › Categories</Crumbs>
      <PageTitle>
        <div>
          <H1>Categories</H1>
          <Muted>Create and manage the humanitarian categories organizations choose from.</Muted>
        </div>
      </PageTitle>

      <Layout>
        <TCard>
          <T>
            <thead>
              <tr><th>Category</th><th>Slug</th><th>Causes</th><th>Status</th><th style={{ textAlign: 'center' }}>Public</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No categories yet.</td></tr>}
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <CatCell>
                      <div className="ic"><Heart size={18} /></div>
                      <div>
                        <div className="n">{c.name}</div>
                        <div className="s">{c.description || '—'}</div>
                      </div>
                    </CatCell>
                  </td>
                  <td>{c.slug}</td>
                  <td>{c.count}</td>
                  <td><Pill $tone={c.active ? 'success' : 'neutral'}>{c.active ? <><Check size={10} strokeWidth={3} />Active</> : 'Inactive'}</Pill></td>
                  <td style={{ textAlign: 'center' }}>
                    <span onClick={() => toggleActive(c.id, c.active)} style={{ display: 'inline-block' }}>
                      <Toggle $on={c.active} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </T>
        </TCard>

        <Sc>
          <h3>New category</h3>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>Visible to organizations once active.</div>
          {err && <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{err}</div>}
          <Field><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Disability Support" /></Field>
          <Field>
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(name) || 'auto-generated'} />
          </Field>
          <Field><Label>Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
          <Field>
            <Label>Public visibility</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
              <span onClick={() => setActive((p) => !p)}><Toggle $on={active} /></span>
              <span style={{ fontSize: 13, color: '#64748B' }}>{active ? 'On · visible publicly' : 'Off · hidden until activated'}</span>
            </div>
          </Field>
          <div style={{ marginTop: 18 }}>
            <Button $variant="primary" $size="md" $block disabled={busy || !name} onClick={create}><Plus size={13} />Create category</Button>
          </div>
        </Sc>
      </Layout>
    </>
  );
}
