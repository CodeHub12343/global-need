'use client';

import {
  LayoutDashboard,
  Heart,
  FilePlus,
  LineChart,
  MessageSquare,
  FolderClosed,
  Building2,
  Users,
  Settings,
} from 'lucide-react';
import { SidebarRoot, SidebarBrand, NavSectionLabel, NavLink } from './Sidebar';
import { MobileNav } from './MobileNav';

function DashNavItems() {
  return (
    <>
      <NavSectionLabel $variant="light">Workspace</NavSectionLabel>
      <NavLink variant="light" href="/dashboard" exact icon={<LayoutDashboard size={16} />}>
        Overview
      </NavLink>
      <NavLink variant="light" href="/dashboard/causes" icon={<Heart size={16} />}>
        My causes
      </NavLink>
      <NavLink variant="light" href="/dashboard/causes/new" icon={<FilePlus size={16} />}>
        Submit a cause
      </NavLink>
      <NavLink variant="light" href="/dashboard/updates" icon={<LineChart size={16} />}>
        Progress updates
      </NavLink>
      <NavLink
        variant="light"
        href="/dashboard/inquiries"
        icon={<MessageSquare size={16} />}
        badge="3"
      >
        Inquiries
      </NavLink>
      <NavLink variant="light" href="/dashboard/documents" icon={<FolderClosed size={16} />}>
        Documents
      </NavLink>
      <NavSectionLabel $variant="light">Organization</NavSectionLabel>
      <NavLink variant="light" href="/dashboard/organization" icon={<Building2 size={16} />}>
        Organization profile
      </NavLink>
      <NavLink variant="light" href="/dashboard/team" icon={<Users size={16} />}>
        Team members
      </NavLink>
      <NavLink variant="light" href="/dashboard/settings" icon={<Settings size={16} />}>
        Settings
      </NavLink>
    </>
  );
}

export function DashSidebar() {
  return (
    <>
      <SidebarRoot $variant="light">
        <SidebarBrand $variant="light">
          <span className="mark">
            <Heart size={16} color="white" fill="white" strokeWidth={0} />
          </span>
          <div>
            <div>Meeting Global Needs</div>
            <span className="sub">Organization dashboard</span>
          </div>
        </SidebarBrand>
        <DashNavItems />
      </SidebarRoot>
      <MobileNav title="Meeting Global Needs" subtitle="Organization dashboard">
        <DashNavItems />
      </MobileNav>
    </>
  );
}
