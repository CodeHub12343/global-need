'use client';

import { useEffect } from 'react';

export default function ReviewerError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[reviewer error]', error); }, [error]);
  return (
    <div style={{ padding: 40, background: '#fff', border: '1px solid #FECACA', borderRadius: 12, margin: 20 }}>
      <h2 style={{ fontFamily: 'Lora, serif', fontSize: 20, color: '#B91C1C', margin: 0, marginBottom: 8 }}>Reviewer workspace error</h2>
      <p style={{ color: '#475569', fontSize: 14, marginBottom: 16 }}>{error.message || 'An unexpected error occurred.'}</p>
      <button onClick={reset} style={{ padding: '8px 16px', background: '#0F766E', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
    </div>
  );
}
