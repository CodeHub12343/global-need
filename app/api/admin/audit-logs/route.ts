import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AuditLog } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    const action = url.searchParams.get('action') || '';
    const actorId = url.searchParams.get('actorId') || '';
    const subjectType = url.searchParams.get('subjectType') || '';
    const since = url.searchParams.get('since') || '30d';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));

    const filter: any = {};
    if (action) filter.action = action;
    if (actorId) filter.actorId = actorId;
    if (subjectType) filter.subjectType = subjectType;
    if (since && since !== 'all') {
      const days = since === '24h' ? 1 : since === '7d' ? 7 : since === '90d' ? 90 : since === 'year' ? 365 : 30;
      filter.createdAt = { $gte: new Date(Date.now() - days * 86400e3) };
    }
    if (q) {
      const r = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ action: r }, { label: r }, { actorName: r }, { subjectDescription: r }];
    }

    const [rows, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ]);

    const items = rows.map((l: any) => ({
      id: String(l._id),
      createdAt: l.createdAt,
      actor: l.actorName ? { id: l.actorId ? String(l.actorId) : null, name: l.actorName, role: l.actorRole, initial: (l.actorName[0] || '?').toUpperCase() } : { id: null, name: 'System', role: 'Automated', initial: 'S' },
      action: l.action,
      label: l.label,
      subjectType: l.subjectType,
      subjectDescription: l.subjectDescription,
      ip: l.ip,
      sessionId: l.sessionId,
      metadata: l.metadata,
    }));

    return ok({ items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  }) as unknown as NextResponse;
}
