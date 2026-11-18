import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, Organization } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { USER_ROLES, USER_STATUSES } from '@/lib/models/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const url = new URL(req.url);
    const tab = url.searchParams.get('tab') || 'all';
    const role = url.searchParams.get('role') || '';
    const status = url.searchParams.get('status') || '';
    const orgId = url.searchParams.get('organizationId') || '';
    const q = (url.searchParams.get('q') || '').trim();
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25', 10) || 25));

    const filter: any = {};
    if (tab === 'rep') filter.role = 'representative';
    else if (tab === 'sup') filter.role = 'supporter';
    else if (tab === 'rev') filter.role = { $in: ['reviewer', 'senior_reviewer'] };
    else if (tab === 'admin') filter.role = { $in: ['org_admin', 'super_admin'] };
    else if (tab === 'suspended') filter.status = 'suspended';
    if (role && USER_ROLES.includes(role as any) && !filter.role) filter.role = role;
    if (status && USER_STATUSES.includes(status as any) && !filter.status) filter.status = status;
    if (orgId) filter.organizationId = orgId;
    if (q) {
      const r = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: r }, { email: r }];
    }

    const [rows, total, counts] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    ]);

    const orgIds = Array.from(new Set(rows.map((u: any) => u.organizationId).filter(Boolean).map(String)));
    const orgs = orgIds.length ? await Organization.find({ _id: { $in: orgIds } }, { name: 1 }).lean() : [];
    const orgMap = new Map(orgs.map((o: any) => [String(o._id), o]));

    const items = rows.map((u: any) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      twoFactorEnabled: !!u.twoFactorEnabled,
      lastSignInAt: u.lastSignInAt,
      createdAt: u.createdAt,
      initial: (u.name?.[0] || '?').toUpperCase(),
      organization: u.organizationId && orgMap.get(String(u.organizationId)) ? { id: String(u.organizationId), name: (orgMap.get(String(u.organizationId)) as any).name } : null,
    }));

    const countsByRole: Record<string, number> = {};
    for (const c of counts) countsByRole[c._id] = c.count;

    return ok({ items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)), countsByRole });
  }) as unknown as NextResponse;
}
