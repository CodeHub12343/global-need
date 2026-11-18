'use client';

import styled from 'styled-components';

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 24px;
`;

export const Panel = Card;

export const PanelHeading = styled.h3`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 17px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0 0 4px;
`;

export const PanelSubtitle = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
  margin: 0 0 16px;
`;
