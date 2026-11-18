'use client';

import styled from 'styled-components';

export const Display = styled.h1`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: clamp(32px, 4.5vw, 56px);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 30px;
    line-height: 1.15;
  }
`;

export const H1 = styled.h1`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.015em;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 22px;
  }
`;

export const H2 = styled.h2`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.015em;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 20px;
  }
`;

export const H3 = styled.h3`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 19px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 16px;
  }
`;

export const Eyebrow = styled.span`
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primary};
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 10px;
    letter-spacing: 0.12em;
  }
`;

export const Lead = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.6;
  margin: 0;
  max-width: 640px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 14px;
    line-height: 1.55;
  }
`;

export const Muted = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 13px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 12px;
  }
`;
