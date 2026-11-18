import type { ReactNode } from 'react';
import { Shell, Main } from '@/components/layout/Topbar';
import { ReviewerSidebar } from '@/components/layout/ReviewerSidebar';

export default function ReviewerLayout({ children }: { children: ReactNode }) {
  return (
    <Shell $sidebarWidth={240}>
      <ReviewerSidebar />
      <Main>{children}</Main>
    </Shell>
  );
}
