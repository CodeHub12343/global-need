import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import StyledComponentsRegistry from '@/lib/registry';
import { GlobalStyles } from '@/lib/global-styles';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: {
    default: 'Meeting Global Needs',
    template: '%s · Meeting Global Needs',
  },
  description:
    'A humanitarian cause discovery and verification platform connecting approved organizations with supporters through transparent, reviewed information.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,500;0,600;0,700;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <StyledComponentsRegistry>
            <GlobalStyles />
            {children}
          </StyledComponentsRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
