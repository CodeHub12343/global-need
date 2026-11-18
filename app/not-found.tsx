import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ padding: 60, maxWidth: 600, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'center' }}>
      <div style={{ fontSize: 72, fontFamily: 'Lora, serif', color: '#0F766E', fontWeight: 600, marginBottom: 8 }}>404</div>
      <h1 style={{ fontFamily: 'Lora, serif', fontSize: 24, color: '#0B1F2A', marginBottom: 10 }}>Page not found</h1>
      <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        style={{ display: 'inline-block', padding: '10px 18px', background: '#0F766E', color: '#fff', borderRadius: 9, fontWeight: 600, textDecoration: 'none' }}
      >
        Back to home
      </Link>
    </div>
  );
}
