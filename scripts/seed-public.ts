/**
 * Seeds only the taxonomy categories. Organizations, causes and progress updates
 * are NOT seeded — real organizations register and submit them through the app,
 * and reviewers verify them. Idempotent (upserts by slug).
 *
 * Run with:  npx tsx --env-file=.env.local scripts/seed-public.ts
 */
import { connectDB } from '../lib/db';
import { Category } from '../lib/models';

const CATEGORIES = [
  { slug: 'orphanages', name: 'Orphanages', description: 'Residential and community care for children.', icon: 'heart', order: 1 },
  { slug: 'foster-care', name: 'Foster Care', description: 'Family placement, respite and resources.', icon: 'users', order: 2 },
  { slug: 'cancer', name: 'Cancer', description: 'Patient support, transport and counseling.', icon: 'heart-pulse', order: 3 },
  { slug: 'diabetes', name: 'Diabetes', description: 'Screening, education and ongoing care.', icon: 'line-chart', order: 4 },
  { slug: 'mental-health', name: 'Mental Health', description: 'Peer support, training and resource hubs.', icon: 'users', order: 5 },
  { slug: 'veterans', name: 'Veterans', description: 'Transition services, peer support and adaptive sports.', icon: 'shield', order: 6 },
  { slug: 'other', name: 'Other Humanitarian Needs', description: 'Other verified humanitarian causes.', icon: 'heart', order: 7 },
];

async function run() {
  await connectDB();

  for (const c of CATEGORIES) {
    await Category.updateOne(
      { slug: c.slug },
      { $set: { ...c, active: true } },
      { upsert: true },
    );
  }
  console.log(`✓ categories: ${CATEGORIES.length}`);

  console.log('\nSeed complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
