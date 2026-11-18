'use client';

import {
  LayoutDashboard,
  Heart,
  Inbox,
  Shield,
  Building2,
  LineChart,
  FolderTree,
  Users,
  CheckSquare,
  MessageSquare,
  BarChart3,
  FileText,
  Settings,
} from 'lucide-react';
import { SidebarRoot, SidebarBrand, NavSectionLabel, NavLink, type SidebarVariant } from './Sidebar';
import { MobileNav } from './MobileNav';

function AdminNavItems({ variant }: { variant: SidebarVariant }) {
  return (
    <>
      <NavSectionLabel $variant={variant}>Overview</NavSectionLabel>
      <NavLink variant={variant} href="/admin" exact icon={<LayoutDashboard size={16} />}>Dashboard</NavLink>
      <NavSectionLabel $variant={variant}>Content</NavSectionLabel>
      <NavLink variant={variant} href="/admin/causes" icon={<Heart size={16} />}>Causes</NavLink>
      <NavLink variant={variant} href="/admin/submissions" icon={<Inbox size={16} />} badge="12">Submission queue</NavLink>
      <NavLink variant={variant} href="/admin/verification" icon={<Shield size={16} />} badge="5">Verification</NavLink>
      <NavLink variant={variant} href="/admin/updates" icon={<LineChart size={16} />}>Update moderation</NavLink>
      <NavLink variant={variant} href="/admin/categories" icon={<FolderTree size={16} />}>Categories</NavLink>
      <NavLink variant={variant} href="/admin/organizations" icon={<Building2 size={16} />}>Organizations</NavLink>
      <NavSectionLabel $variant={variant}>People</NavSectionLabel>
      <NavLink variant={variant} href="/admin/users" icon={<Users size={16} />}>Users</NavLink>
      <NavLink variant={variant} href="/admin/reviewers" icon={<CheckSquare size={16} />}>Reviewers</NavLink>
      <NavLink variant={variant} href="/admin/inquiries" icon={<MessageSquare size={16} />}>Inquiries</NavLink>
      <NavSectionLabel $variant={variant}>Platform</NavSectionLabel>
      <NavLink variant={variant} href="/admin/reports" icon={<BarChart3 size={16} />}>Reports</NavLink>
      <NavLink variant={variant} href="/admin/audit-logs" icon={<FileText size={16} />}>Audit logs</NavLink>
      <NavLink variant={variant} href="/admin/settings" icon={<Settings size={16} />}>Settings</NavLink>
    </>
  );
}

export function AdminSidebar() {
  return (
    <>
      <SidebarRoot $variant="dark">
        <SidebarBrand $variant="dark">
          <span className="mark">
            <Heart size={15} color="white" fill="white" strokeWidth={0} />
          </span>
          <div>
            <div>Meeting Global Needs</div>
            <span className="sub">Super admin</span>
          </div>
        </SidebarBrand>
        <AdminNavItems variant="dark" />
      </SidebarRoot>
      <MobileNav title="Meeting Global Needs" subtitle="Super admin">
        <AdminNavItems variant="light" />
      </MobileNav>
    </>
  );
}
