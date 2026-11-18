import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import { User, logAudit } from './models';
import type { UserRole } from './models/types';
import { rateLimit, clearRateLimit } from './rate-limit';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 14 },
  pages: {
    signIn: '/sign-in',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase();
        const gate = rateLimit({ key: `signin:${email}`, limit: 8, windowMs: 15 * 60_000 });
        if (!gate.ok) {
          throw new Error(`Too many attempts. Try again in ${Math.ceil(gate.retryAfterMs / 60_000)} minute(s).`);
        }
        await connectDB();
        const user = await User.findOne({ email }).select('+passwordHash').lean();
        if (!user) return null;
        if (user.status === 'suspended') {
          logAudit({ actorName: email, action: 'auth.signin.suspended', label: 'Blocked sign-in for suspended account', subjectType: 'user', subjectId: user._id as any, subjectDescription: email }).catch(() => {});
          throw new Error('Account suspended');
        }
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        clearRateLimit(`signin:${email}`);
        User.updateOne({ _id: user._id }, { $set: { lastSignInAt: new Date() } }).catch(() => {});
        logAudit({ actorId: user._id as any, actorName: user.name, actorRole: user.role, action: 'auth.signin', label: 'Signed in', subjectType: 'user', subjectId: user._id as any, subjectDescription: email }).catch(() => {});
        return {
          id: String(user._id),
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          organizationId: user.organizationId ? String(user.organizationId) : null,
          emailVerified: user.emailVerified ?? false,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.organizationId = (user as any).organizationId;
        token.emailVerified = (user as any).emailVerified;
        token.status = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.organizationId = token.organizationId as string | null;
        session.user.emailVerified = Boolean(token.emailVerified);
        session.user.status = token.status as string;
      }
      return session;
    },
  },
};
