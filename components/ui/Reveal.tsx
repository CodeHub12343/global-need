'use client';

import { useEffect, useRef, type ReactNode, type CSSProperties, type ElementType } from 'react';

type Props = {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

export function Reveal({ children, as: Tag = 'div', delay = 0, className, style }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      el.setAttribute('data-reveal', 'in');
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      el.setAttribute('data-reveal', 'in');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const target = e.target as HTMLElement;
            window.setTimeout(() => target.setAttribute('data-reveal', 'in'), delay);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const mergedStyle: CSSProperties = { ...style };
  return (
    <Tag ref={ref as any} data-reveal="" className={className} style={mergedStyle}>
      {children}
    </Tag>
  );
}
