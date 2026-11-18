'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const Wrap = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 56px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 36px 20px;
    gap: 10px;
    border-radius: 14px;
  }
`;

const IconCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary50};
  color: ${({ theme }) => theme.colors.primary};
  display: grid;
  place-items: center;
  margin-bottom: 4px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 52px;
    height: 52px;
  }
`;

const Title = styled.h3`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 17px;
  }
`;

const Body = styled.p`
  margin: 0;
  max-width: 440px;
  font-size: 14.5px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.muted};
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 13px;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
  justify-content: center;
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  &:hover { background: ${({ theme }) => theme.colors.primary800}; }
`;

const GhostLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.ink};
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.primary}; }
`;

interface Props {
  icon: ReactNode;
  title: string;
  body: string;
  primaryHref?: string;
  primaryLabel?: string;
  onSecondary?: () => void;
  secondaryLabel?: string;
}

export function EmptyState({ icon, title, body, primaryHref, primaryLabel, onSecondary, secondaryLabel }: Props) {
  return (
    <Wrap>
      <IconCircle>{icon}</IconCircle>
      <Title>{title}</Title>
      <Body>{body}</Body>
      {(primaryHref || onSecondary) && (
        <Actions>
          {primaryHref && primaryLabel && <PrimaryLink href={primaryHref}>{primaryLabel}</PrimaryLink>}
          {onSecondary && secondaryLabel && <GhostLink onClick={onSecondary}>{secondaryLabel}</GhostLink>}
        </Actions>
      )}
    </Wrap>
  );
}
