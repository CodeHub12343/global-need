// Shapes server docs into dashboard-friendly JSON.

export function shapeCauseRow(c: any) {
  return {
    id: String(c._id),
    slug: c.slug,
    publicId: c.publicId || null,
    title: c.title,
    category: c.category,
    shortDescription: c.shortDescription || '',
    story: c.story || '',
    need: c.need || '',
    whoItSupports: c.whoItSupports || '',
    intendedUse: c.intendedUse || '',
    whyNow: c.whyNow || '',
    primaryAssistance: c.primaryAssistance || '',
    timeline: c.timeline || '',
    country: c.country || '',
    city: c.city || '',
    gradient: c.gradient || 'linear-gradient(135deg,#0F766E,#115E59)',
    status: c.status,
    featured: !!c.featured,
    submittedAt: c.submittedAt || null,
    publishedAt: c.publishedAt || null,
    lastUpdatedAt: c.lastUpdatedAt || c.updatedAt || null,
    createdAt: c.createdAt || null,
    reviewerFeedback: c.reviewerFeedback || '',
    decisionReason: c.decisionReason || '',
    views: c.views || 0,
    inquiriesCount: c.inquiriesCount || 0,
  };
}

export function shapeUpdateRow(u: any, cause?: any) {
  return {
    id: String(u._id),
    causeId: String(u.causeId),
    causeTitle: cause?.title || '',
    causeSlug: cause?.slug || '',
    title: u.title,
    body: u.body || '',
    status: u.status,
    submittedAt: u.submittedAt || null,
    approvedAt: u.approvedAt || null,
    reviewerFeedback: u.reviewerFeedback || '',
    createdAt: u.createdAt || null,
    updatedAt: u.updatedAt || null,
    consentLogAttached: !!u.consentLogAttached,
    views: u.views || 0,
  };
}

export function shapeInquiryListItem(i: any, assignee?: any) {
  return {
    id: String(i._id),
    fromName: i.fromName,
    fromEmail: i.fromEmail,
    phone: i.phone || '',
    type: i.type,
    scope: i.scope,
    causeId: i.causeId ? String(i.causeId) : null,
    subject: i.subject,
    status: i.status,
    tags: i.tags || [],
    unreadForOrg: !!i.unreadForOrg,
    assignee: assignee ? { id: String(assignee._id), name: assignee.name } : null,
    lastMessageAt: i.messages?.length ? i.messages[i.messages.length - 1].at : i.createdAt,
    preview: i.messages?.length ? i.messages[i.messages.length - 1].body : i.initialBody,
    createdAt: i.createdAt,
  };
}

export function shapeInquiryFull(i: any, assignee?: any, cause?: any) {
  return {
    ...shapeInquiryListItem(i, assignee),
    initialBody: i.initialBody,
    resolvedAt: i.resolvedAt || null,
    cause: cause ? { id: String(cause._id), slug: cause.slug, title: cause.title } : null,
    messages: (i.messages || []).map((m: any) => ({
      id: String(m._id),
      senderName: m.senderName,
      senderRole: m.senderRole,
      senderId: m.senderId ? String(m.senderId) : null,
      body: m.body,
      at: m.at,
    })),
  };
}

export function shapeTeamMember(u: any) {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    emailVerified: !!u.emailVerified,
    lastSignInAt: u.lastSignInAt || null,
    createdAt: u.createdAt,
  };
}

export function shapeDocument(d: any) {
  return {
    id: String(d._id),
    filename: d.filename,
    originalName: d.originalName,
    size: d.size,
    mimeType: d.mimeType,
    url: d.url || '',
    type: d.type,
    isPrivate: !!d.isPrivate,
    consentLogAttached: !!d.consentLogAttached,
    causeId: d.causeId ? String(d.causeId) : null,
    uploadedById: d.uploadedById ? String(d.uploadedById) : null,
    createdAt: d.createdAt,
  };
}
