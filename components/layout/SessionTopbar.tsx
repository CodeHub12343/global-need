'use client';

import { useEffect, useState } from 'react';
import { Topbar } from './Topbar';

interface Props {
  searchPlaceholder?: string;
  fallbackName: string;
  fallbackInitial: string;
  fallbackRole: string;
  showOrgInsteadOfRole?: boolean;
}

/**
 * Wraps the design-only <Topbar /> and overrides its user props with the
 * real signed-in user when a session is present. If the viewer isn't signed
 * in yet (e.g. preview / screenshot), it falls back to the design placeholder.
 */
export function SessionTopbar({
  searchPlaceholder,
  fallbackName,
  fallbackInitial,
  fallbackRole,
  showOrgInsteadOfRole,
}: Props) {
  const [me, setMe] = useState<{
    name: string;
    initial: string;
    role: string;
    orgName?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) return;
        const { data } = await res.json();
        if (cancelled || !data?.user) return;
        setMe({
          name: data.user.name,
          initial: data.user.initial,
          role: labelFor(data.user.role),
          orgName: data.organization?.name,
        });
      } catch {
        // ignore — fall back to placeholder
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const name = me?.name ?? fallbackName;
  const initial = me?.initial ?? fallbackInitial;
  const role = showOrgInsteadOfRole
    ? me?.orgName ?? fallbackRole
    : me?.role ?? fallbackRole;

  return (
    <Topbar
      searchPlaceholder={searchPlaceholder}
      userName={name}
      userInitial={initial}
      userRole={role}
    />
  );
}

function labelFor(role: string): string {
  switch (role) {
    case 'representative': return 'Representative';
    case 'org_admin': return 'Org admin';
    case 'reviewer': return 'Reviewer';
    case 'senior_reviewer': return 'Senior reviewer';
    case 'super_admin': return 'Super admin';
    default: return 'Supporter';
  }
}
