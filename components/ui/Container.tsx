'use client';

import { useEffect, useRef, forwardRef, type ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 0 20px;
  }
`;

export const Section = styled.section<{ $bg?: 'bg' | 'warm' | 'surface' }>`
  padding: 72px 0;
  background: ${({ theme, $bg = 'bg' }) =>
    $bg === 'warm' ? theme.colors.bgWarm : $bg === 'surface' ? '#fff' : theme.colors.bg};
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 48px 0;
  }
`;

const SectionHeadBase = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 36px;
  flex-wrap: wrap;
`;

export const SectionHead = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function SectionHead(props, ref) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      const el = innerRef.current;
      if (!el || typeof window === 'undefined') return;
      const reduce =
        'matchMedia' in window &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || !('IntersectionObserver' in window)) {
        el.setAttribute('data-reveal', 'in');
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              (e.target as HTMLElement).setAttribute('data-reveal', 'in');
              io.unobserve(e.target);
            }
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
      );
      io.observe(el);
      return () => io.disconnect();
    }, []);
    const setRef = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as any).current = node;
    };
    return <SectionHeadBase {...props} ref={setRef} data-reveal="" />;
  },
);
