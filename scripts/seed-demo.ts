/**
 * Seeds additional demo data so the admin and reviewer workspaces aren't empty:
 *  - 2 pending organizations awaiting verification (with sample documents)
 *  - 3 pending causes in the review queue
 *  - 1 pending progress update
 *  - 2 public inquiries (one unassigned, one waiting)
 *
 * Idempotent — safe to re-run.
 * Requires: seed-public (orgs, categories) and seed-reviewers (admin user).
 *
 * Run with:  npm run seed:demo
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
import { Organization, Cause, ProgressUpdate, Inquiry, User, DocumentFile, logAudit } from '../lib/models';

const PENDING_ORGS = [
  {
    slug: 'hearthstone-foundation',
    name: 'Hearthstone Foundation',
    initial: 'H',
    category: 'cancer',
    country: 'USA',
    city: 'Boston',
    shortDescription: 'Short-stay family lodging near pediatric cancer centers.',
    description:
      'Hearthstone Foundation operates short-stay family lodging near pediatric cancer centers, offering families a dignified place to rest during treatment. We partner with regional hospitals and never share patient-identifying information in public communications.',
    publicEmail: 'contact@hearthstone.sample',
    gradient: 'linear-gradient(135deg,#B45309,#92400E)',
    operatingSince: '2018',
    admin: { name: 'Hearthstone Admin', email: 'admin@hearthstone.sample' },
    docs: [
      { originalName: 'Nonprofit registration certificate.pdf', size: 2400000, mimeType: 'application/pdf', type: 'registration' },
      { originalName: 'Governance and board roster.pdf', size: 1100000, mimeType: 'application/pdf', type: 'governance' },
      { originalName: 'Reference letter - partner hospital.pdf', size: 280000, mimeType: 'application/pdf', type: 'reference' },
    ],
  },
  {
    slug: 'oasis-youth-centers',
    name: 'Oasis Youth Centers',
    initial: 'O',
    category: 'orphanages',
    country: 'Kenya',
    city: 'Nairobi',
    shortDescription: 'Community youth centers with after-school care.',
    description:
      'Oasis Youth Centers operate three neighborhood sites with after-school care, tutoring and meals for children aged 6-16.',
    publicEmail: 'contact@oasis-youth.sample',
    gradient: 'linear-gradient(135deg,#0F766E,#115E59)',
    operatingSince: '2020',
    admin: { name: 'Oasis Admin', email: 'admin@oasis-youth.sample' },
    docs: [
      { originalName: 'NGO registration.pdf', size: 1800000, mimeType: 'application/pdf', type: 'registration' },
      { originalName: 'Program outcomes memo.docx', size: 640000, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', type: 'other' },
    ],
  },
];

const PENDING_CAUSES = [
  {
    orgSlug: 'hope-haven-trust',
    slug: 'rainy-season-shelter-repairs',
    title: 'Rainy-season shelter repairs',
    category: 'other',
    shortDescription: 'Urgent roof and drainage repairs before the rainy season.',
    story: 'Three dormitory roofs and the central drainage line need repair before the coming rainy season.',
    need: 'Roofing sheets, timber, and drainage pipes plus two weeks of contractor labor.',
    whoItSupports: 'All 48 children at Hope Haven Trust orphanage',
    intendedUse: 'Materials and contractor labor for roof repairs and drainage line replacement.',
    country: 'Uganda',
    city: 'Kampala',
    publicId: 'MGN-26-9131',
    daysAgo: 1,
  },
  {
    orgSlug: 'still-waters-collective',
    slug: 'peer-counselor-training-cohort',
    title: 'Peer-counselor training — new cohort',
    category: 'mental-health',
    shortDescription: 'Safeguarding and listening-skills training for 20 new facilitators.',
    story: 'Twenty new peer facilitators have been recruited; this training cohort equips them with safeguarding and active-listening skills.',
    need: 'Trainer honoraria, venue and materials for a 3-day intensive.',
    whoItSupports: '20 peer facilitators serving a regional mental-health support network',
    intendedUse: 'Trainer fees, venue rental, participant materials.',
    country: 'Uganda',
    city: 'Kampala',
    publicId: 'MGN-26-9140',
    daysAgo: 3,
    status: 'changes' as const,
    reviewerFeedback: 'Please add a concrete outcome measure and the facilitator shortlist process.',
  },
  {
    orgSlug: 'hope-health-trust',
    slug: 'mobile-oncology-outreach',
    title: 'Mobile oncology outreach pilot',
    category: 'cancer',
    shortDescription: 'Weekly mobile clinic reaching three underserved districts.',
    story: 'A weekly mobile outreach clinic to reach three districts with limited oncology access.',
    need: 'Vehicle fuel, nurse and counselor stipends, screening-kit supplies.',
    whoItSupports: 'Communities in three underserved districts',
    intendedUse: 'Fuel, staff stipends and screening consumables for a 12-week pilot.',
    country: 'Kenya',
    city: 'Nairobi',
    publicId: 'MGN-26-9136',
    daysAgo: 2,
  },
];

const PENDING_UPDATES = [
  {
    causeSlug: 'childrens-wellness-education-fund',
    title: 'Mid-term learning outcomes summary',
    body: 'Students completed mid-term assessments. Aggregate scores improved in literacy by 11% and numeracy by 8%. No identifying information is included.',
  },
];

const INQUIRIES = [
  {
    fromName: 'Sample Supporter',
    fromEmail: 'supporter@example.sample',
    subject: 'Volunteering opportunities this quarter',
    initialBody: 'Hi — I would love to help with weekend tutoring. What is the current intake process? Thanks!',
    type: 'volunteer' as const,
    scope: 'cause' as const,
    causeSlug: 'childrens-wellness-education-fund',
    status: 'new' as const,
  },
  {
    fromName: 'Sample Partner',
    fromEmail: 'partner@example.sample',
    subject: 'Partnership — regional nutrition NGO',
    initialBody: 'We would like to explore a partnership on the nutrition side of your program. Available for a call next week.',
    type: 'partnership' as const,
    scope: 'organization' as const,
    orgSlug: 'hope-haven-trust',
    status: 'waiting' as const,
  },
];

async function run() {
  await connectDB();
  const admin = await User.findOne({ email: 'admin@mgn.sample' });
  if (!admin) {
    console.error('Run `npm run seed:reviewers` first to create the super admin.');
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash('SamplePass1!', 12);

  // Pending orgs with docs
  for (const o of PENDING_ORGS) {
    let org = await Organization.findOne({ slug: o.slug });
    if (!org) {
      org = await Organization.create({
        slug: o.slug, name: o.name, initial: o.initial, category: o.category,
        country: o.country, city: o.city, shortDescription: o.shortDescription,
        description: o.description, publicEmail: o.publicEmail, gradient: o.gradient,
        operatingSince: o.operatingSince, status: 'pending',
      });
    }
    let repUser = await User.findOne({ email: o.admin.email.toLowerCase() });
    if (!repUser) {
      repUser = await User.create({
        name: o.admin.name, email: o.admin.email.toLowerCase(), passwordHash,
        role: 'org_admin', status: 'active', emailVerified: true, organizationId: org._id,
      });
    }
    if (!org.adminIds.map((x: any) => String(x)).includes(String(repUser._id))) {
      org.adminIds.push(repUser._id as any);
      await org.save();
    }
    for (const d of o.docs) {
      const existing = await DocumentFile.findOne({ organizationId: org._id, originalName: d.originalName });
      if (!existing) {
        await DocumentFile.create({
          organizationId: org._id, uploadedById: repUser._id,
          filename: d.originalName, originalName: d.originalName, size: d.size,
          mimeType: d.mimeType, type: d.type, isPrivate: true,
        });
      }
    }
  }
  console.log(`✓ pending orgs: ${PENDING_ORGS.length}`);

  // Pending causes
  for (const c of PENDING_CAUSES) {
    const org = await Organization.findOne({ slug: c.orgSlug });
    if (!org) continue;
    const rep = await User.findOne({ organizationId: org._id });
    const payload: any = {
      slug: c.slug, publicId: c.publicId, title: c.title, category: c.category,
      shortDescription: c.shortDescription, story: c.story, need: c.need,
      whoItSupports: c.whoItSupports, intendedUse: c.intendedUse,
      country: c.country, city: c.city, organizationId: org._id,
      submittedById: rep?._id, status: c.status ?? 'pending',
      submittedAt: new Date(Date.now() - c.daysAgo * 86400e3),
      gradient: org.gradient,
      reviewerFeedback: (c as any).reviewerFeedback,
    };
    const existing = await Cause.findOne({ slug: c.slug });
    if (existing) await Cause.updateOne({ _id: existing._id }, { $set: payload });
    else await Cause.create(payload);
  }
  console.log(`✓ pending causes: ${PENDING_CAUSES.length}`);

  // Pending updates
  for (const u of PENDING_UPDATES) {
    const cause = await Cause.findOne({ slug: u.causeSlug });
    if (!cause) continue;
    const author = cause.submittedById || (await User.findOne({ organizationId: cause.organizationId }))?._id;
    if (!author) continue;
    const existing = await ProgressUpdate.findOne({ causeId: cause._id, title: u.title });
    const payload: any = {
      causeId: cause._id, organizationId: cause.organizationId, authorId: author,
      title: u.title, body: u.body, status: 'pending',
      submittedAt: new Date(Date.now() - 6 * 3600e3),
    };
    if (existing) await ProgressUpdate.updateOne({ _id: existing._id }, { $set: payload });
    else await ProgressUpdate.create(payload);
  }
  console.log(`✓ pending updates: ${PENDING_UPDATES.length}`);

  // Inquiries
  for (const i of INQUIRIES) {
    const cause = (i as any).causeSlug ? await Cause.findOne({ slug: (i as any).causeSlug }) : null;
    const org = (i as any).orgSlug ? await Organization.findOne({ slug: (i as any).orgSlug }) : cause ? await Organization.findById(cause.organizationId) : null;
    const existing = await Inquiry.findOne({ fromEmail: i.fromEmail, subject: i.subject });
    if (existing) continue;
    await Inquiry.create({
      fromName: i.fromName, fromEmail: i.fromEmail, subject: i.subject,
      initialBody: i.initialBody, type: i.type, scope: i.scope,
      causeId: cause?._id, organizationId: org?._id, status: i.status,
    });
  }
  console.log(`✓ inquiries: ${INQUIRIES.length}`);

  // Seed one audit entry so audit log is non-empty on first run
  const existingAudit = await (await import('../lib/models')).AuditLog.findOne({ action: 'admin.demo.seed' });
  if (!existingAudit) {
    await logAudit({
      actorId: admin._id as any, actorName: admin.name, actorRole: admin.role,
      action: 'admin.demo.seed', label: 'Seeded demo data',
      subjectType: 'system', subjectDescription: 'Initial demo dataset loaded',
    });
  }

  console.log('\nDemo seed complete.');
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
