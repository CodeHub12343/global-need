/**
 * ONE-TIME PURGE: removes the six demo organizations and their .sample admin users
 * seeded during development. Safe to re-run — only affects the known fake slugs/emails.
 *
 * Run with:  npx tsx --env-file=.env.local scripts/purge-seed-orgs.ts
 */
import { connectDB } from '../lib/db';
import { Organization, User, Cause, ProgressUpdate } from '../lib/models';

const SEED_ORG_SLUGS = [
  'hope-haven-trust',
  'hope-health-trust',
  'still-waters-collective',
  'hearth-home-alliance',
  'steadfast-veterans-guild',
  'wellspring-community-health',
];

const SEED_ADMIN_EMAILS = [
  'amara@hopehaven.sample',
  'daniel@hopehealth.sample',
  'lin@stillwaters.sample',
  'maria@hearthhome.sample',
  'jordan@steadfast.sample',
  'priya@wellspring.sample',
];

async function run() {
  await connectDB();

  const orgs = await Organization.find({ slug: { $in: SEED_ORG_SLUGS } }).select('_id slug');
  const orgIds = orgs.map((o) => o._id);

  // Any residual causes / progress updates tied to these orgs
  const updRes = await ProgressUpdate.deleteMany({ organizationId: { $in: orgIds } });
  console.log(`✓ progress updates removed: ${updRes.deletedCount}`);

  const causeRes = await Cause.deleteMany({ organizationId: { $in: orgIds } });
  console.log(`✓ causes removed: ${causeRes.deletedCount}`);

  const userRes = await User.deleteMany({ email: { $in: SEED_ADMIN_EMAILS.map((e) => e.toLowerCase()) } });
  console.log(`✓ seed admin users removed: ${userRes.deletedCount}`);

  const orgRes = await Organization.deleteMany({ slug: { $in: SEED_ORG_SLUGS } });
  console.log(`✓ seed organizations removed: ${orgRes.deletedCount}`);

  console.log('\nPurge complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
