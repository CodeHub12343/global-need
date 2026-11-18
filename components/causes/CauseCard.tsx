'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { Check } from 'lucide-react';
import type { Cause } from '@/lib/mock-data';
import { CATEGORY_LABEL } from '@/lib/mock-data';

const Card = styled(Link)`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  text-decoration: none;
  min-width: 0;
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
const Hero = styled.div<{ $gradient: string }>`
  height: 200px;
  background: ${({ $gradient }) => $gradient};
  position: relative;
  overflow: hidden;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) { height: 96px; }
`;
const CatTag = styled.span`
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(255, 255, 255, 0.95);
  padding: 5px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.primary800};
  text-transform: uppercase;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    top: 8px; left: 8px; padding: 3px 7px; font-size: 9px; letter-spacing: 0.04em;
  }
`;
const Body = styled.div`
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 12px;
    gap: 6px;
  }
`;
const Title = styled.h3`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 19px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0;
  line-height: 1.3;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 13.5px;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
const Desc = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.55;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 11.5px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: auto;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
  gap: 6px;
  .org {
    color: ${({ theme }) => theme.colors.ink};
    font-weight: 600;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .verified {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: ${({ theme }) => theme.colors.success};
    font-weight: 600;
    font-size: 12px;
    flex-shrink: 0;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding-top: 8px;
    font-size: 11px;
    .verified { font-size: 10px; svg { width: 10px; height: 10px; } }
  }
`;

export function CauseCard({ cause }: { cause: Cause }) {
  return (
    <Card href={`/causes/${cause.slug}`}>
      <Hero $gradient={cause.gradient} aria-hidden="true">
        <CatTag>{CATEGORY_LABEL[cause.category]}</CatTag>
      </Hero>
      <Body>
        <Title>{cause.title}</Title>
        <Desc>{cause.shortDescription}</Desc>
        <Meta>
          <span className="org">{cause.organization.name}</span>
          {cause.organization.verified && (
            <span className="verified">
              <Check size={12} strokeWidth={3} />
              Verified
            </span>
          )}
        </Meta>
      </Body>
    </Card>
  );
}
