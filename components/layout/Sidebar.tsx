'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled, { css } from 'styled-components';
import type { ReactNode } from 'react';

export type SidebarVariant = 'light' | 'primary' | 'dark';

const variants = {
  light: css`
    background: #fff;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  `,
  primary: css`
    background: ${({ theme }) => theme.colors.primary800};
    color: rgba(255, 255, 255, 0.85);
  `,
  dark: css`
    background: ${({ theme }) => theme.colors.ink};
    color: rgba(255, 255, 255, 0.85);
  `,
};

export const SidebarRoot = styled.aside<{ $variant: SidebarVariant }>`
  padding: 22px 16px;
  display: flex;
  flex-direction: column;
  ${({ $variant }) => variants[$variant]};
  min-height: 100vh;
`;

export const SidebarBrand = styled.div<{ $variant: SidebarVariant }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 22px;
  border-bottom: 1px solid
    ${({ $variant, theme }) =>
      $variant === 'light' ? theme.colors.border : 'rgba(255,255,255,.1)'};
  margin-bottom: 16px;
  color: ${({ $variant, theme }) => ($variant === 'light' ? theme.colors.ink : '#fff')};
  font-weight: 700;
  font-size: 14px;
  .sub {
    display: block;
    font-size: 11px;
    font-weight: 500;
    color: ${({ $variant, theme }) =>
      $variant === 'light' ? theme.colors.muted : 'rgba(255,255,255,.55)'};
    margin-top: 2px;
  }
  .mark {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.primary800}
    );
    display: grid;
    place-items: center;
    color: #fff;
    flex-shrink: 0;
    ${({ $variant }) =>
      $variant === 'primary' &&
      css`
        background: rgba(255, 255, 255, 0.15);
      `}
  }
`;

export const NavSectionLabel = styled.div<{ $variant: SidebarVariant }>`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ $variant, theme }) =>
    $variant === 'light' ? theme.colors.muted2 : 'rgba(255,255,255,.4)'};
  padding: 14px 8px 8px;
`;

export const NavItem = styled(Link)<{ $active?: boolean; $variant: SidebarVariant }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 2px;
  color: ${({ $variant, theme }) =>
    $variant === 'light' ? theme.colors.text : 'rgba(255,255,255,.85)'};
  svg {
    color: ${({ $variant, theme }) =>
      $variant === 'light' ? theme.colors.muted : 'rgba(255,255,255,.7)'};
    flex-shrink: 0;
  }
  ${({ $variant, $active, theme }) =>
    $active &&
    ($variant === 'light'
      ? css`
          background: ${theme.colors.primary50};
          color: ${theme.colors.primary800};
          font-weight: 600;
          svg {
            color: ${theme.colors.primary};
          }
        `
      : css`
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          font-weight: 600;
          svg {
            color: #fff;
          }
        `)}
  &:hover {
    ${({ $variant, $active }) =>
      !$active &&
      ($variant === 'light'
        ? css`
            background: ${({ theme }) => theme.colors.bg};
          `
        : css`
            background: rgba(255, 255, 255, 0.06);
          `)}
  }
  .badge {
    margin-left: auto;
    background: ${({ $variant, theme }) =>
      $variant === 'light' ? theme.colors.accent50 : theme.colors.accent};
    color: ${({ $variant, theme }) => ($variant === 'light' ? theme.colors.accent : '#fff')};
    font-size: 11px;
    font-weight: 700;
    padding: 1px 7px;
    border-radius: 999px;
  }
`;

export function useIsActive() {
  const pathname = usePathname();
  return (href: string, { exact = false } = {}) =>
    exact ? pathname === href : pathname === href || pathname?.startsWith(href + '/');
}

export function NavLink({
  href,
  icon,
  children,
  badge,
  exact,
  variant,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  badge?: ReactNode;
  exact?: boolean;
  variant: SidebarVariant;
}) {
  const isActive = useIsActive();
  return (
    <NavItem href={href} $active={isActive(href, { exact })} $variant={variant}>
      {icon}
      <span>{children}</span>
      {badge !== undefined && <span className="badge">{badge}</span>}
    </NavItem>
  );
}
