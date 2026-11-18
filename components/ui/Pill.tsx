'use client';

import styled, { css } from 'styled-components';
import type { CauseStatus } from '@/lib/mock-data';

export type PillTone =
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'outline';

const toneStyles = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary100};
    color: ${({ theme }) => theme.colors.primary800};
  `,
  accent: css`
    background: ${({ theme }) => theme.colors.accent50};
    color: ${({ theme }) => theme.colors.accent600};
  `,
  success: css`
    background: ${({ theme }) => theme.colors.success50};
    color: ${({ theme }) => theme.colors.success};
  `,
  warning: css`
    background: ${({ theme }) => theme.colors.warning50};
    color: ${({ theme }) => theme.colors.warning};
  `,
  error: css`
    background: ${({ theme }) => theme.colors.error50};
    color: ${({ theme }) => theme.colors.error};
  `,
  info: css`
    background: ${({ theme }) => theme.colors.info50};
    color: ${({ theme }) => theme.colors.info};
  `,
  neutral: css`
    background: ${({ theme }) => theme.colors.bgSoft};
    color: #475569;
  `,
  outline: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.muted};
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  `,
};

export const Pill = styled.span<{ $tone?: PillTone }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  ${({ $tone = 'neutral' }) => toneStyles[$tone]};
`;

const STATUS_TONE: Record<CauseStatus, PillTone> = {
  draft: 'neutral',
  pending: 'warning',
  changes: 'info',
  approved: 'success',
  rejected: 'error',
  suspended: 'neutral',
};

const STATUS_LABEL: Record<CauseStatus, string> = {
  draft: 'Draft',
  pending: 'Pending Review',
  changes: 'Changes Requested',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
};

export function StatusPill({ status }: { status: CauseStatus }) {
  return <Pill $tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Pill>;
}
