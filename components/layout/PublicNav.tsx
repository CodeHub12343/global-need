'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import styled from 'styled-components';
import { ChevronDown, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { LinkButton } from '@/components/ui/Button';

const Nav = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const Row = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { padding: 0 20px; }
`;
const Links = styled.nav`
  display: flex;
  gap: 28px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { display: none; }
  a {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
    font-size: 15px;
    &:hover { color: ${({ theme }) => theme.colors.primary}; }
    &[data-active='true'] { color: ${({ theme }) => theme.colors.primary700}; }
  }
`;
const DesktopCta = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  position: relative;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { display: none; }
`;
const MobileToggle = styled.button`
  display: none;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) { display: inline-flex; }
`;
const MobilePanel = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: block;
    padding: 16px 20px 24px;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    background: #fff;
    a { display: block; padding: 10px 0; color: ${({ theme }) => theme.colors.text}; font-weight: 500; border-bottom: 1px solid ${({ theme }) => theme.colors.border}; }
    .mcta { display: flex; gap: 10px; margin-top: 14px; }
  }
`;
const UserChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  .av { width: 28px; height: 28px; border-radius: 999px; background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primary800}); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 12px; }
  .nm { font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.ink}; }
`;
const Menu2 = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  min-width: 220px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 6px;
  z-index: 40;
  .mi { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 13px; color: ${({ theme }) => theme.colors.ink}; font-weight: 500; cursor: pointer; width: 100%; background: none; border: none; text-align: left; font-family: inherit; text-decoration: none; }
  .mi:hover { background: ${({ theme }) => theme.colors.bg}; }
  .mi svg { color: ${({ theme }) => theme.colors.muted}; }
  .mi.danger { color: ${({ theme }) => theme.colors.error}; }
  .mi.danger svg { color: ${({ theme }) => theme.colors.error}; }
  .hr { border-top: 1px solid ${({ theme }) => theme.colors.border}; margin: 6px 0; }
  .em { padding: 10px 12px 4px; font-size: 11px; color: ${({ theme }) => theme.colors.muted}; }
  .rl { padding: 0 12px 6px; font-size: 11px; color: ${({ theme }) => theme.colors.primary700}; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
`;

const LINKS = [
  { href: '/causes', label: 'Causes' },
  { href: '/organizations', label: 'Organizations' },
  { href: '/impact', label: 'Impact' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
];

function roleLabel(role?: string) {
  if (!role) return '';
  switch (role) {
    case 'representative': return 'Representative';
    case 'org_admin': return 'Org admin';
    case 'reviewer': return 'Reviewer';
    case 'senior_reviewer': return 'Senior reviewer';
    case 'super_admin': return 'Super admin';
    default: return 'Supporter';
  }
}

function dashboardFor(role?: string) {
  if (role === 'super_admin') return '/admin';
  if (role === 'reviewer' || role === 'senior_reviewer') return '/reviewer';
  if (role === 'representative' || role === 'org_admin') return '/dashboard';
  return '/account';
}

function dashboardLabel(role?: string) {
  if (role === 'supporter' || !role) return 'My account';
  return 'Dashboard';
}

export function PublicNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');
  const signedIn = status === 'authenticated' && session?.user;
  const initial = signedIn ? (session!.user.name?.charAt(0).toUpperCase() ?? '?') : '';
  const dashHref = dashboardFor(session?.user.role);

  return (
    <Nav>
      <Row>
        <Logo />
        <Links>
          {LINKS.map((l) => (
            <Link key={l.href + l.label} href={l.href} data-active={isActive(l.href)}>
              {l.label}
            </Link>
          ))}
        </Links>
        <DesktopCta>
          {signedIn ? (
            <>
              <LinkButton as={Link} href={dashHref} $variant="ghost" $size="md">
                <LayoutDashboard size={14} /> {dashboardLabel(session?.user.role)}
              </LinkButton>
              <UserChip onClick={() => setMenu((v) => !v)} aria-label="Account menu">
                <span className="av">{initial}</span>
                <span className="nm">{session!.user.name?.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </UserChip>
              {menu && (
                <Menu2 onMouseLeave={() => setMenu(false)}>
                  <div className="em">{session!.user.email}</div>
                  <div className="rl">{roleLabel(session!.user.role)}</div>
                  <div className="hr" />
                  <Link href={dashHref} className="mi" onClick={() => setMenu(false)}>
                    <LayoutDashboard size={14} /> {dashboardLabel(session?.user.role)}
                  </Link>
                  <div className="hr" />
                  <button className="mi danger" onClick={() => signOut({ callbackUrl: '/' })}>
                    <LogOut size={14} /> Sign out
                  </button>
                </Menu2>
              )}
            </>
          ) : (
            <>
              <LinkButton as={Link} href="/sign-in" $variant="ghost" $size="md">Sign in</LinkButton>
              <LinkButton as={Link} href="/register" $variant="primary" $size="md">Submit a cause</LinkButton>
            </>
          )}
        </DesktopCta>
        <MobileToggle aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </MobileToggle>
      </Row>
      {open && (
        <MobilePanel>
          {LINKS.map((l) => (
            <Link key={l.href + l.label} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          {signedIn ? (
            <>
              <Link href={dashHref} onClick={() => setOpen(false)}>{dashboardLabel(session?.user.role)}</Link>
              <div className="mcta">
                <LinkButton
                  as="button"
                  type="button"
                  $variant="ghost"
                  $size="md"
                  $block
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign out
                </LinkButton>
              </div>
            </>
          ) : (
            <div className="mcta">
              <LinkButton as={Link} href="/sign-in" $variant="ghost" $size="md" $block>Sign in</LinkButton>
              <LinkButton as={Link} href="/register" $variant="primary" $size="md" $block>Submit</LinkButton>
            </div>
          )}
        </MobilePanel>
      )}
    </Nav>
  );
}
