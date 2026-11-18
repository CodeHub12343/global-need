'use client';

import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'success' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  $variant?: ButtonVariant;
  $size?: ButtonSize;
  $block?: boolean;
}

const variantStyles = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    &:hover {
      background: ${({ theme }) => theme.colors.primary700};
    }
  `,
  ghost: css`
    background: #fff;
    color: ${({ theme }) => theme.colors.ink};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
    }
  `,
  danger: css`
    background: #fff;
    color: ${({ theme }) => theme.colors.error};
    border-color: #fca5a5;
  `,
  success: css`
    background: ${({ theme }) => theme.colors.success};
    color: #fff;
  `,
  warning: css`
    background: #fff;
    color: ${({ theme }) => theme.colors.warning};
    border-color: #fbbf24;
  `,
};

const sizeStyles = {
  sm: css`
    padding: 7px 12px;
    font-size: 13px;
    border-radius: 8px;
  `,
  md: css`
    padding: 10px 16px;
    font-size: 14px;
    border-radius: ${({ theme }) => theme.radii.md};
  `,
  lg: css`
    padding: 12px 20px;
    font-size: 15px;
    border-radius: ${({ theme }) => theme.radii.lg};
  `,
};

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  ${({ $variant = 'primary' }) => variantStyles[$variant]};
  ${({ $size = 'md' }) => sizeStyles[$size]};
  ${({ $block }) => $block && 'width: 100%;'}
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const LinkButton = Button;
