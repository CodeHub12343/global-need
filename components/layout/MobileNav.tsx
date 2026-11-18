'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { Menu, X, Heart } from 'lucide-react';

const Bar = styled.header`
  display: none;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 40;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    gap: 10px;
  }
`;
const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  .mark {
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primary800});
    display: grid; place-items: center; flex-shrink: 0;
  }
  .t {
    font-weight: 700; font-size: 14px; color: ${({ theme }) => theme.colors.ink};
    line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .s {
    font-size: 11px; color: ${({ theme }) => theme.colors.muted};
    line-height: 1.1;
  }
`;
const Burger = styled.button`
  width: 40px; height: 40px;
  display: grid; place-items: center;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.ink};
  cursor: pointer;
  flex-shrink: 0;
  &:active { transform: scale(0.96); }
`;

const fadeIn = keyframes`from { opacity: 0 } to { opacity: 1 }`;
const slideIn = keyframes`from { transform: translateX(-100%) } to { transform: translateX(0) }`;

const Backdrop = styled.div`
  position: fixed; inset: 0;
  background: rgba(11, 31, 42, 0.5);
  z-index: 60;
  animation: ${fadeIn} .18s ease;
`;
const Drawer = styled.nav`
  position: fixed; top: 0; left: 0; bottom: 0;
  width: min(84vw, 320px);
  background: #fff;
  z-index: 61;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 48px rgba(11, 31, 42, 0.22);
  animation: ${slideIn} .22s cubic-bezier(.2,.8,.2,1);
  overflow-y: auto;
  .dhead {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    position: sticky; top: 0; background: #fff; z-index: 1;
  }
  .dbody { padding: 10px 10px 24px; display: flex; flex-direction: column; }
  .close {
    width: 36px; height: 36px; border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: #fff; display: grid; place-items: center;
    color: ${({ theme }) => theme.colors.ink}; cursor: pointer;
  }
`;

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function MobileNav({ title, subtitle, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <>
      <Bar>
        <Brand>
          <span className="mark"><Heart size={16} color="white" fill="white" strokeWidth={0} /></span>
          <div style={{ minWidth: 0 }}>
            <div className="t">{title}</div>
            {subtitle && <div className="s">{subtitle}</div>}
          </div>
        </Brand>
        <Burger aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu size={20} />
        </Burger>
      </Bar>
      {open && (
        <>
          <Backdrop onClick={() => setOpen(false)} />
          <Drawer role="dialog" aria-label="Navigation">
            <div className="dhead">
              <Brand>
                <span className="mark"><Heart size={16} color="white" fill="white" strokeWidth={0} /></span>
                <div style={{ minWidth: 0 }}>
                  <div className="t">{title}</div>
                  {subtitle && <div className="s">{subtitle}</div>}
                </div>
              </Brand>
              <button className="close" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="dbody">{children}</div>
          </Drawer>
        </>
      )}
    </>
  );
}
