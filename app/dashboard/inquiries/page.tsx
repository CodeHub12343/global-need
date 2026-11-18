'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Archive, UserPlus, MoreVertical, Send, Info, Check } from 'lucide-react';
import { SessionTopbar } from '@/components/layout/SessionTopbar';
import { Crumbs } from '@/components/layout/Topbar';
import { H1 } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { dashApi } from '@/lib/dashboard-api';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
  align-items: flex-start;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { grid-template-columns: 1fr; }
`;
const List = styled.aside` background: #fff; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 14px; overflow: hidden; `;
const ListHead = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 15px; color: ${({ theme }) => theme.colors.ink}; margin: 0; font-weight: 600; }
  .c { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; background: ${({ theme }) => theme.colors.bg}; padding: 2px 8px; border-radius: 999px; font-weight: 700; }
`;
const Filters = styled.div`
  padding: 10px 14px;
  display: flex;
  gap: 6px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
`;
const F = styled.button<{ $active?: boolean }>`
  padding: 5px 10px;
  border-radius: 999px;
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.bg)};
  color: ${({ $active }) => ($active ? '#fff' : '#64748B')};
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
`;
const Item = styled.div<{ $active?: boolean; $unread?: boolean }>`
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: ${({ $active, $unread, theme }) => ($active ? theme.colors.primary50 : $unread ? '#F0FDFA' : '#fff')};
  box-shadow: ${({ $active, theme }) => ($active ? `inset 3px 0 0 ${theme.colors.primary}` : 'none')};
  &:hover { background: ${({ $active }) => ($active ? '#ECFDF5' : '#FAFBFC')}; }
  .av { width: 36px; height: 36px; border-radius: 999px; background: #0E7490; color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 13px; flex-shrink: 0; position: relative; }
  .av.unread::after { content: ''; position: absolute; top: 0; right: 0; width: 9px; height: 9px; background: ${({ theme }) => theme.colors.primary}; border-radius: 999px; border: 2px solid #fff; }
  .n { font-weight: 700; color: ${({ theme }) => theme.colors.ink}; font-size: 13px; line-height: 1.3; display: flex; justify-content: space-between; gap: 8px; .t { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; font-weight: 500; flex-shrink: 0; } }
  .s { font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; margin-top: 4px; line-height: 1.3; }
  .p { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; margin-top: 4px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .meta { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
`;
const Tag = styled.span`
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  background: ${({ theme }) => theme.colors.primary100};
  color: ${({ theme }) => theme.colors.primary800};
`;
const Detail = styled.section`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  display: flex;
  flex-direction: column;
`;
const DHead = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  h2 { font-family: ${({ theme }) => theme.fonts.serif}; font-size: 20px; color: ${({ theme }) => theme.colors.ink}; margin: 0 0 6px; font-weight: 600; }
  .m { font-size: 12px; color: ${({ theme }) => theme.colors.muted}; display: flex; gap: 12px; flex-wrap: wrap; strong { color: ${({ theme }) => theme.colors.ink}; } }
  .a { display: flex; gap: 6px; }
  button { width: 32px; height: 32px; border: 1px solid ${({ theme }) => theme.colors.border}; background: #fff; border-radius: 7px; display: grid; place-items: center; color: ${({ theme }) => theme.colors.muted}; cursor: pointer; }
`;
const Notice = styled.div`
  background: ${({ theme }) => theme.colors.primary50};
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  color: ${({ theme }) => theme.colors.primary800};
  padding: 10px 14px;
  border-radius: 9px;
  font-size: 12px;
  margin: 12px 24px 0;
  display: flex;
  gap: 8px;
  align-items: center;
  svg { flex-shrink: 0; }
`;
const Thread = styled.div`
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 60vh;
  overflow-y: auto;
`;
const Msg = styled.div<{ $us?: boolean }>`
  display: flex;
  gap: 12px;
  flex-direction: ${({ $us }) => ($us ? 'row-reverse' : 'row')};
  .av { width: 36px; height: 36px; border-radius: 999px; color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 13px; flex-shrink: 0; background: ${({ $us, theme }) => ($us ? theme.colors.primary : '#0E7490')}; }
  .mb { background: ${({ $us, theme }) => ($us ? theme.colors.primary50 : theme.colors.bg)}; color: ${({ $us, theme }) => ($us ? theme.colors.ink : theme.colors.text)}; border-radius: 10px; padding: 14px 16px; max-width: 85%; font-size: 14px; line-height: 1.5; white-space: pre-wrap; }
  .mn { font-size: 11px; color: ${({ theme }) => theme.colors.muted}; margin-bottom: 4px; font-weight: 600; }
`;
const Reply = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px 20px;
  background: ${({ theme }) => theme.colors.bg};
  textarea { width: 100%; padding: 12px; border: 1px solid ${({ theme }) => theme.colors.borderStrong}; border-radius: 9px; font-size: 14px; font-family: inherit; min-height: 90px; resize: vertical; background: #fff;
    &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px rgba(15,118,110,.12); }
  }
  .foot { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; gap: 10px; flex-wrap: wrap; }
`;

const TAB_OPTS = [
  { k: 'all', l: 'All' },
  { k: 'unread', l: 'Unread' },
  { k: 'awaiting', l: 'Awaiting reply' },
  { k: 'resolved', l: 'Resolved' },
  { k: 'volunteer', l: 'Volunteer' },
  { k: 'partnership', l: 'Partnership' },
];

function initialsOf(name: string): string {
  return name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
}
function rt(iso: string | null): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.max(0, Math.round(ms / 3600e3));
  if (h < 2) return 'just now';
  if (h < 48) return `${h}h ago`;
  const d = Math.round(ms / 86400e3);
  if (d < 14) return `${d}d ago`;
  return `${Math.round(d / 7)}w ago`;
}

export default function DashInquiriesPage() {
  const [tab, setTab] = useState('all');
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<{ unread?: number; awaiting?: number }>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  async function reload() {
    try {
      const data = await dashApi.inquiries.list({ tab });
      setItems(data.items);
      setCounts(data.counts);
      if (!activeId && data.items[0]) setActiveId(data.items[0].id);
    } catch {}
  }
  useEffect(() => { reload(); }, [tab]);

  useEffect(() => {
    if (!activeId) return;
    dashApi.inquiries.get(activeId).then(setDetail).catch(() => {});
    dashApi.inquiries.patch(activeId, { markRead: true }).catch(() => {});
  }, [activeId]);

  async function sendReply() {
    if (!activeId || !reply.trim()) return;
    setSending(true);
    try {
      await dashApi.inquiries.reply(activeId, reply.trim());
      setReply('');
      const d = await dashApi.inquiries.get(activeId);
      setDetail(d);
    } catch (err: any) { alert(err.message); } finally { setSending(false); }
  }

  async function markResolved() {
    if (!activeId) return;
    try {
      await dashApi.inquiries.patch(activeId, { status: 'resolved' });
      const d = await dashApi.inquiries.get(activeId);
      setDetail(d);
      reload();
    } catch (err: any) { alert(err.message); }
  }

  return (
    <>
      <SessionTopbar fallbackName="Organization" fallbackInitial="O" fallbackRole="Organization" showOrgInsteadOfRole />
      <Crumbs>Dashboard › Inquiries</Crumbs>
      <H1 style={{ marginBottom: 20 }}>Inquiries</H1>

      <Layout>
        <List>
          <ListHead>
            <h3>All inquiries</h3>
            <span className="c">{counts.unread || 0} unread</span>
          </ListHead>
          <Filters>
            {TAB_OPTS.map((t) => (
              <F key={t.k} $active={tab === t.k} onClick={() => setTab(t.k)}>{t.l}</F>
            ))}
          </Filters>
          {items.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 13 }}>No inquiries here.</div>
          ) : items.map((i) => (
            <Item key={i.id} $active={i.id === activeId} $unread={i.unreadForOrg} onClick={() => setActiveId(i.id)}>
              <div className={`av ${i.unreadForOrg ? 'unread' : ''}`}>{initialsOf(i.fromName)}</div>
              <div style={{ flexGrow: 1 }}>
                <div className="n"><span>{i.fromName}</span><span className="t">{rt(i.lastMessageAt)}</span></div>
                <div className="s">{i.subject}</div>
                <div className="p">{i.preview}</div>
                <div className="meta">
                  <Tag>{i.type}</Tag>
                  {i.status === 'resolved' && <Tag>Resolved</Tag>}
                </div>
              </div>
            </Item>
          ))}
        </List>

        <Detail>
          {detail ? (
            <>
              <DHead>
                <div>
                  <h2>{detail.subject}</h2>
                  <div className="m">
                    <span>From <strong>{detail.fromName}</strong></span>
                    <span>{detail.fromEmail}</span>
                    <span>Received {rt(detail.createdAt)}</span>
                  </div>
                </div>
                <div className="a">
                  <button title="Mark resolved" onClick={markResolved}><Check size={14} /></button>
                  <button title="Archive"><Archive size={14} /></button>
                  <button><MoreVertical size={14} /></button>
                </div>
              </DHead>
              <Notice>
                <Info size={14} />
                Messages are delivered through the platform. Do not share private documents or personal financial details.
              </Notice>
              <Thread>
                {detail.messages.map((m: any) => (
                  <Msg key={m.id} $us={m.senderRole !== 'public'}>
                    <div className="av">{initialsOf(m.senderName)}</div>
                    <div>
                      <div className="mn">{m.senderName} · {rt(m.at)}</div>
                      <div className="mb">{m.body}</div>
                    </div>
                  </Msg>
                ))}
              </Thread>
              <Reply>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply…"
                />
                <div className="foot">
                  <span style={{ fontSize: 12, color: '#64748B' }}>Your reply is logged to the inquiry thread.</span>
                  <Button $variant="primary" $size="sm" disabled={sending || !reply.trim()} onClick={sendReply}>
                    {sending ? 'Sending…' : <>Send reply<Send size={13} /></>}
                  </Button>
                </div>
              </Reply>
            </>
          ) : (
            <div style={{ padding: 60, textAlign: 'center', color: '#64748B' }}>Select an inquiry to view it.</div>
          )}
        </Detail>
      </Layout>
    </>
  );
}
