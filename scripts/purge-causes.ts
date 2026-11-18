/**
 * ONE-TIME PURGE: deletes every cause and progress update from the DB.
 * Run this once to remove the seeded demo causes before going live.
 * Organizations, categories, and users are left untouched.
 *
 * Run with:  npx tsx scripts/purge-causes.ts
 */
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
for (const file of ['.env.local', '.env']) {
  const p = resolve(process.cwd(), file);
  if (existsSync(p)) loadEnv({ path: p });
}

import { connectDB } from '../lib/db';
import { Cause, ProgressUpdate } from '../lib/models';

async function run() {
  await connectDB();

  const updatesResult = await ProgressUpdate.deleteMany({});
  console.log(`✓ progress updates removed: ${updatesResult.deletedCount}`);

  const causesResult = await Cause.deleteMany({});
  console.log(`✓ causes removed: ${causesResult.deletedCount}`);

  console.log('\nPurge complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
