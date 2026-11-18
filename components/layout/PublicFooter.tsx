'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { Heart } from 'lucide-react';

const Foot = styled.footer`
  background: ${({ theme }) => theme.colors.ink};
  color: rgba(255, 255, 255, 0.75);
  padding: 64px 0 32px;
`;
const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0 20px;
  }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 48px;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;
const Col = styled.div`
  h5 {
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 16px;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  a {
    color: rgba(255, 255, 255, 0.65);
    font-size: 14px;
    &:hover {
      color: #fff;
    }
  }
`;
const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-weight: 700;
  font-size: 17px;
  margin-bottom: 12px;
  span.mark {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: linear-gradient(135deg, #2dd4bf, ${({ theme }) => theme.colors.primary});
    display: grid;
    place-items: center;
  }
`;
const Bottom = styled.div`
  padding-top: 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  flex-wrap: wrap;
  gap: 16px;
`;

export function PublicFooter() {
  return (
    <Foot>
      <Inner>
        <Grid>
          <Col>
            <Brand>
              <span className="mark">
                <Heart size={18} fill="white" strokeWidth={0} />
              </span>
              <span>Meeting Global Needs</span>
            </Brand>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,.65)', maxWidth: 320, margin: 0 }}>
              A humanitarian cause discovery and verification platform connecting approved
              organizations with supporters through transparent, reviewed information.
            </p>
          </Col>
          <Col>
            <h5>Discover</h5>
            <ul>
              <li><Link href="/causes">Browse causes</Link></li>
              <li><Link href="/organizations">Organizations</Link></li>
              <li><Link href="/impact">Impact &amp; updates</Link></li>
            </ul>
          </Col>
          <Col>
            <h5>Organizations</h5>
            <ul>
              <li><Link href="/register">Submit a cause</Link></li>
              <li><Link href="/how-it-works">How it works</Link></li>
              <li><Link href="/sign-in">Dashboard sign in</Link></li>
            </ul>
          </Col>
          <Col>
            <h5>About</h5>
            <ul>
              <li><Link href="/about">About us</Link></li>
              <li><Link href="/about">Contact</Link></li>
              <li><Link href="/about">Privacy policy</Link></li>
              <li><Link href="/about">Terms of service</Link></li>
            </ul>
          </Col>
        </Grid>
        <Bottom>
          <span>© Meeting Global Needs. Platform 1 of the Three-Platform Ecosystem.</span>
          <span>Illustrative sample content shown throughout the design.</span>
        </Bottom>
      </Inner>
    </Foot>
  );
}
