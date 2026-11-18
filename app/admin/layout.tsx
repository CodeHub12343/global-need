import type { ReactNode } from 'react';
import { Shell, Main } from '@/components/layout/Topbar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Shell $sidebarWidth={240}>
      <AdminSidebar />
      <Main>{children}</Main>
    </Shell>
  );
}
