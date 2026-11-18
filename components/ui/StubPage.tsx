'use client';

import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Palette } from 'lucide-react';

const Wrap = styled.div`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary50},
    ${({ theme }) => theme.colors.accent50}
  );
  border: 1px dashed ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 40px;
  text-align: center;
  color: ${({ theme }) => theme.colors.ink};
  margin: 20px 0;
  max-width: 820px;
  .ic {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: #fff;
    display: inline-grid;
    place-items: center;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 14px;
  }
  h2 {
    font-family: ${({ theme }) => theme.fonts.serif};
    font-size: 24px;
    margin: 0 0 8px;
    font-weight: 600;
  }
  p {
    margin: 0 0 10px;
    color: ${({ theme }) => theme.colors.text};
    font-size: 15px;
    line-height: 1.6;
  }
  .ref {
    margin-top: 16px;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.muted};
    font-style: italic;
  }
`;

export function StubPage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Wrap>
      <span className="ic">
        <Palette size={22} />
      </span>
      <h2>{title}</h2>
      <p>
        {children ??
          'This screen is part of the Meeting Global Needs design canvas. The route, navigation and layout shell are in place — the full build-out continues from here.'}
      </p>
      <div className="ref">See the canvas artboard for the complete visual spec.</div>
    </Wrap>
  );
}
