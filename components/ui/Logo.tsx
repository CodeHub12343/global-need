'use client';

import styled from 'styled-components';
import { Heart } from 'lucide-react';
import Link from 'next/link';

const Wrap = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ink};
  font-size: 17px;
  text-decoration: none;
`;

const Mark = styled.span<{ $size?: number }>`
  width: ${({ $size = 34 }) => $size}px;
  height: ${({ $size = 34 }) => $size}px;
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
`;

export function Logo({
  href = '/',
  compact = false,
  size = 34,
  subtitle,
}: {
  href?: string;
  compact?: boolean;
  size?: number;
  subtitle?: string;
}) {
  return (
    <Wrap href={href}>
      <Mark $size={size}>
        <Heart size={Math.round(size * 0.5)} fill="white" strokeWidth={0} />
      </Mark>
      {!compact && (
        <span>
          <span>Meeting Global Needs</span>
          {subtitle && (
            <span
              style={{ display: 'block', fontSize: 11, color: '#64748B', fontWeight: 500 }}
            >
              {subtitle}
            </span>
          )}
        </span>
      )}
    </Wrap>
  );
}
