'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[app error]', error);
  }, [error]);

  return (
    <div style={{ padding: 60, maxWidth: 600, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ fontFamily: 'Lora, serif', fontSize: 28, color: '#0B1F2A', marginBottom: 10 }}>Something went wrong</h1>
      <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
        An unexpected error occurred. You can try again, or return to the home page.
      </p>
      {error.digest && (
        <p style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'ui-monospace, monospace', marginBottom: 20 }}>
          Reference: {error.digest}
        </p>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={reset}
          style={{ padding: '10px 18px', background: '#0F766E', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 600, cursor: 'pointer' }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{ padding: '10px 18px', background: '#fff', color: '#0F766E', border: '1px solid #0F766E', borderRadius: 9, fontWeight: 600, textDecoration: 'none' }}
        >
          Home
        </Link>
      </div>
    </div>
  );
}
