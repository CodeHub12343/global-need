/**
 * Seeds reviewer and super_admin accounts. Idempotent on email.
 * Run with: npm run seed:reviewers
 */
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
for (const file of ['.env.local', '.env']) {
  const p = resolve(process.cwd(), file);
  if (existsSync(p)) loadEnv({ path: p });
}

import bcrypt from 'bcryptjs';
import { connectDB } from '../lib/db';
import { User } from '../lib/models';

const USERS = [
  { name: 'Senior Reviewer', email: 'senior-reviewer@mgn.sample', role: 'senior_reviewer', capabilities: ['cause', 'update', 'organization'] },
  { name: 'Reviewer', email: 'reviewer@mgn.sample', role: 'reviewer', capabilities: ['cause', 'update'] },
  { name: 'Platform Admin', email: 'admin@mgn.sample', role: 'super_admin', capabilities: ['*'] },
];

async function run() {
  await connectDB();
  const hash = await bcrypt.hash('SamplePass1!', 12);
  for (const u of USERS) {
    const existing = await User.findOne({ email: u.email.toLowerCase() });
    if (existing) {
      existing.role = u.role as any;
      existing.status = 'active';
      existing.emailVerified = true;
      existing.reviewerCapabilities = u.capabilities;
      await existing.save();
      console.log(`↻ updated ${u.email}`);
    } else {
      await User.create({
        name: u.name,
        email: u.email.toLowerCase(),
        passwordHash: hash,
        role: u.role,
        status: 'active',
        emailVerified: true,
        reviewerCapabilities: u.capabilities,
      });
      console.log(`✓ created ${u.email}`);
    }
  }
  console.log('\nSeed complete.');
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
