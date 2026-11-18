'use client';

import styled from 'styled-components';

export const Field = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin-bottom: 6px;
`;

const inputStyles = `
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #CBD5E1;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: #0B1F2A;
  background: #fff;
  &:focus {
    outline: none;
    border-color: #0F766E;
    box-shadow: 0 0 0 3px rgba(15,118,110,.12);
  }
  &[aria-invalid="true"] {
    border-color: #B91C1C;
  }
`;

export const Input = styled.input`
  ${inputStyles}
`;

export const Select = styled.select`
  ${inputStyles}
`;

export const Textarea = styled.textarea`
  ${inputStyles}
  resize: vertical;
  min-height: 90px;
`;

export const Hint = styled.p<{ $error?: boolean }>`
  font-size: 12px;
  color: ${({ theme, $error }) => ($error ? theme.colors.error : theme.colors.muted)};
  margin: 4px 0 0;
`;
