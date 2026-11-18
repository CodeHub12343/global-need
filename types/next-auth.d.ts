import 'next-auth';
import 'next-auth/jwt';
import type { UserRole } from '@/lib/models/types';

declare module 'next-auth' {
  interface User {
    id: string;
    role: UserRole;
    organizationId: string | null;
    emailVerified: boolean;
    status: string;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      organizationId: string | null;
      emailVerified: boolean;
      status: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    organizationId: string | null;
    emailVerified: boolean;
    status: string;
  }
}
