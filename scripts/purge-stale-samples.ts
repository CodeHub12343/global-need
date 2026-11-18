/**
 * ONE-TIME: remove stale sample accounts/orgs created during earlier seeds with
 * person-named identities (Robin, Lin, Samira, Marcus, Faith) and test supporter
 * accounts (dashtest*@example.com), plus the two pending-review demo orgs.
 *
 * Run with: npx tsx --env-file=.env.local scripts/purge-stale-samples.ts
 */
import { connectDB } from '../lib/db';
import { Organization, User, Cause, ProgressUpdate, Inquiry, DocumentFile } from '../lib/models';

const STALE_ORG_SLUGS = ['hearthstone-foundation', 'oasis-youth-centers'];
const STALE_USER_EMAILS = [
  'robin@mgn.sample',
  'lin@mgn.sample',
  'samira@mgn.sample',
  'marcus@hearthstone.sample',
  'faith@oasis-youth.sample',
];
const STALE_INQUIRY_EMAILS = ['jane.doe@example.sample', 'marco@partner.sample'];

async function run() {
  await connectDB();

  // 1. remove the two pending demo orgs + anything tied to them
  const orgs = await Organization.find({ slug: { $in: STALE_ORG_SLUGS } }).select('_id slug');
  const orgIds = orgs.map((o) => o._id);
  if (orgIds.length) {
    const docs = await DocumentFile.deleteMany({ organizationId: { $in: orgIds } });
    console.log(`✓ documents removed: ${docs.deletedCount}`);
    const u = await ProgressUpdate.deleteMany({ organizationId: { $in: orgIds } });
    console.log(`✓ progress updates removed: ${u.deletedCount}`);
    const c = await Cause.deleteMany({ organizationId: { $in: orgIds } });
    console.log(`✓ causes removed: ${c.deletedCount}`);
  }
  const orgRes = await Organization.deleteMany({ slug: { $in: STALE_ORG_SLUGS } });
  console.log(`✓ stale orgs removed: ${orgRes.deletedCount}`);

  // 2. remove stale reviewer / admin / org-admin users by email
  const userRes = await User.deleteMany({
    email: { $in: STALE_USER_EMAILS.map((e) => e.toLowerCase()) },
  });
  console.log(`✓ stale named users removed: ${userRes.deletedCount}`);

  // 3. remove any dashtest*@example.com supporter test accounts
  const testUsers = await User.deleteMany({
    email: { $regex: /^dashtest\d+@example\.com$/i },
  });
  console.log(`✓ dashtest supporter accounts removed: ${testUsers.deletedCount}`);

  // 4. remove sample inquiries
  const inqRes = await Inquiry.deleteMany({
    fromEmail: { $in: STALE_INQUIRY_EMAILS.map((e) => e.toLowerCase()) },
  });
  console.log(`✓ sample inquiries removed: ${inqRes.deletedCount}`);

  console.log('\nStale sample purge complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
