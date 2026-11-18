import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PlatformSetting, DEFAULT_SETTINGS, logAudit } from '@/lib/models';
import { ok, withErrors, parseJSON } from '@/lib/api';
import { requireAdmin } from '@/lib/admin-auth';
import { settingsPatchSchema } from '@/lib/validation/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const rows = await PlatformSetting.find({}).lean();
    const values: Record<string, unknown> = { ...DEFAULT_SETTINGS };
    for (const r of rows) values[(r as any).key] = (r as any).value;
    return ok({ values });
  }) as unknown as NextResponse;
}

export async function PATCH(req: Request) {
  return withErrors(async () => {
    const user = await requireAdmin();
    if (user instanceof Response) return user;
    await connectDB();
    const input = await parseJSON(req, settingsPatchSchema);
    const before: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input.values)) {
      const existing = await PlatformSetting.findOne({ key });
      before[key] = existing ? (existing as any).value : (DEFAULT_SETTINGS as any)[key];
      await PlatformSetting.updateOne(
        { key },
        { $set: { key, value, updatedById: user.id, group: key.split('.')[0] || 'general' } },
        { upsert: true },
      );
    }
    await logAudit({
      actorId: user.id as any, actorName: user.name, actorRole: user.role,
      action: 'admin.settings.patch', label: 'Updated platform settings',
      subjectType: 'settings', subjectDescription: `${Object.keys(input.values).length} key(s)`,
      metadata: { before, after: input.values },
    });
    return ok({ updated: Object.keys(input.values).length });
  }) as unknown as NextResponse;
}
