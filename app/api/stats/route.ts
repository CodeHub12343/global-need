import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cause, Organization, ProgressUpdate, Category } from '@/lib/models';
import { ok, withErrors } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return withErrors(async () => {
    await connectDB();
    const [publishedCauses, verifiedOrgs, approvedUpdates, categories] = await Promise.all([
      Cause.countDocuments({ status: 'approved' }),
      Organization.countDocuments({ status: 'verified' }),
      ProgressUpdate.countDocuments({ status: 'approved' }),
      Category.countDocuments({ active: true }),
    ]);
    return ok({
      publishedCauses,
      verifiedOrgs,
      approvedUpdates,
      categories,
      verificationCheckpoints: 3,
      reviewedBeforePublishingPct: 100,
    });
  }) as unknown as NextResponse;
}
