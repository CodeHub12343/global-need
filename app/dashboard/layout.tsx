import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { Shell, Main } from '@/components/layout/Topbar';
import { DashSidebar } from '@/components/layout/DashSidebar';
import { getSession } from '@/lib/session';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session?.user?.id) redirect('/sign-in?callbackUrl=/dashboard');
  const role = session.user.role;
  if (role === 'super_admin') redirect('/admin');
  if (role === 'reviewer' || role === 'senior_reviewer') redirect('/reviewer');
  if (role === 'supporter') redirect('/account');
  return (
    <Shell>
      <DashSidebar />
      <Main>{children}</Main>
    </Shell>
  );
}
