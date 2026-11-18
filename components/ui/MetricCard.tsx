'use client';

import type { ReactNode } from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 22px;
  position: relative;
`;
const Label = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.muted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;
const Value = styled.div`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 32px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  letter-spacing: -0.01em;
  margin-top: 8px;
  line-height: 1;
`;
const Delta = styled.div<{ $tone?: 'positive' | 'warning' | 'error' | 'neutral' }>`
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme, $tone = 'positive' }) =>
    $tone === 'warning'
      ? theme.colors.warning
      : $tone === 'error'
      ? theme.colors.error
      : $tone === 'neutral'
      ? theme.colors.muted
      : theme.colors.success};
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

interface Props {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  deltaTone?: 'positive' | 'warning' | 'error' | 'neutral';
}

export function MetricCard({ label, value, delta, deltaTone }: Props) {
  return (
    <Wrap>
      <Label>{label}</Label>
      <Value>{value}</Value>
      {delta && <Delta $tone={deltaTone}>{delta}</Delta>}
    </Wrap>
  );
}
