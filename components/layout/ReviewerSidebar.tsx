'use client';

import { LayoutDashboard, FileText, LineChart, Clock, User, Shield } from 'lucide-react';
import { SidebarRoot, SidebarBrand, NavSectionLabel, NavLink, type SidebarVariant } from './Sidebar';
import { MobileNav } from './MobileNav';

function ReviewerNavItems({ variant }: { variant: SidebarVariant }) {
  return (
    <>
      <NavSectionLabel $variant={variant}>Review</NavSectionLabel>
      <NavLink variant={variant} href="/reviewer" exact icon={<LayoutDashboard size={16} />}>Overview</NavLink>
      <NavLink variant={variant} href="/reviewer/submissions" icon={<FileText size={16} />} badge="5">Submission queue</NavLink>
      <NavLink variant={variant} href="/reviewer/updates" icon={<LineChart size={16} />} badge="2">Progress updates</NavLink>
      <NavLink variant={variant} href="/reviewer/history" icon={<Clock size={16} />}>Review history</NavLink>
      <NavSectionLabel $variant={variant}>Account</NavSectionLabel>
      <NavLink variant={variant} href="/reviewer/profile" icon={<User size={16} />}>Profile &amp; settings</NavLink>
    </>
  );
}

export function ReviewerSidebar() {
  return (
    <>
      <SidebarRoot $variant="primary">
        <SidebarBrand $variant="primary">
          <span className="mark">
            <Shield size={15} color="white" strokeWidth={2.2} />
          </span>
          <div>
            <div>Meeting Global Needs</div>
            <span className="sub">Reviewer workspace</span>
          </div>
        </SidebarBrand>
        <ReviewerNavItems variant="primary" />
      </SidebarRoot>
      <MobileNav title="Meeting Global Needs" subtitle="Reviewer workspace">
        <ReviewerNavItems variant="light" />
      </MobileNav>
    </>
  );
}
