'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Heart } from 'lucide-react';

const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary50} 0%,
    ${({ theme }) => theme.colors.bgWarm} 100%
  );
  padding: 40px 20px;
`;
const Inner = styled.div`
  max-width: 560px;
  margin: 0 auto;
`;
const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.ink};
  font-size: 17px;
  margin-bottom: 36px;
  text-decoration: none;
  .mark {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.primary800}
    );
    display: grid;
    place-items: center;
    color: #fff;
  }
`;
const Card = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 28px 20px;
  }
`;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Page>
      <Inner>
        <Brand href="/">
          <span className="mark">
            <Heart size={18} fill="white" strokeWidth={0} />
          </span>
          <span>Meeting Global Needs</span>
        </Brand>
        <Card>{children}</Card>
      </Inner>
    </Page>
  );
}
