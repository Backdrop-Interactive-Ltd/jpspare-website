import { prisma } from "../db";
import { getCampaignTargetSegments } from "../campaigns/segment-targeting";
import { previewCustomerSegment } from "./preview";

function rulesCount(rulesJson) {
  if (!rulesJson || typeof rulesJson !== "object" || Array.isArray(rulesJson)) return 0;
  return Object.keys(rulesJson).length;
}

function percent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function latestDate(...values) {
  const dates = values
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());
  return dates[0] || null;
}

function serializeDate(value) {
  return value?.toISOString?.() ?? value ?? null;
}

async function campaignsForSegment(segmentId) {
  const campaigns = await prisma.promotionCampaign.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      actionsJson: true,
      updatedAt: true,
    },
    orderBy: [{ updatedAt: "desc" }],
  }).catch(() => []);

  return campaigns.filter((campaign) => getCampaignTargetSegments(campaign).some((segment) => segment.id === segmentId));
}

async function audienceForSegment(segment, limit = 1000) {
  const preview = await previewCustomerSegment({ prisma, rulesJson: segment.rulesJson, page: 1, limit });
  return preview.items || [];
}

function audienceRecipients(audience) {
  return {
    ids: audience.map((customer) => customer.id).filter(Boolean),
    emails: audience.map((customer) => customer.email).filter(Boolean),
    phones: audience.map((customer) => customer.phone).filter(Boolean),
  };
}

async function emailStatsForAudience(emails) {
  if (!emails.length) {
    return { total: 0, sent: 0, failed: 0, pending: 0, successRate: 0, latest: [], lastSentAt: null };
  }

  const [logs, grouped] = await Promise.all([
    prisma.emailDeliveryLog.findMany({
      where: { recipientEmail: { in: emails } },
      orderBy: [{ createdAt: "desc" }],
      take: 10,
      select: {
        id: true,
        recipientEmail: true,
        subject: true,
        status: true,
        sentAt: true,
        createdAt: true,
        errorMessage: true,
      },
    }),
    prisma.emailDeliveryLog.groupBy({
      by: ["status"],
      where: { recipientEmail: { in: emails } },
      _count: { _all: true },
    }),
  ]);

  const counts = Object.fromEntries(grouped.map((item) => [item.status, item._count._all]));
  const total = grouped.reduce((sum, item) => sum + item._count._all, 0);

  return {
    total,
    sent: counts.SENT || 0,
    failed: counts.FAILED || 0,
    pending: counts.PENDING || 0,
    successRate: percent(counts.SENT || 0, total),
    latest: logs.map((log) => ({ ...log, sentAt: serializeDate(log.sentAt), createdAt: serializeDate(log.createdAt), type: "EMAIL" })),
    lastSentAt: serializeDate(latestDate(...logs.map((log) => log.sentAt || log.createdAt))),
  };
}

async function notificationStatsForAudience({ ids, emails, phones }) {
  const recipients = Array.from(new Set([...ids, ...emails, ...phones].filter(Boolean)));
  if (!recipients.length) {
    return { total: 0, sent: 0, failed: 0, pending: 0, read: 0, successRate: 0, latest: [], lastSentAt: null };
  }

  const [logs, grouped] = await Promise.all([
    prisma.notificationLog.findMany({
      where: { recipient: { in: recipients } },
      orderBy: [{ createdAt: "desc" }],
      take: 10,
      select: {
        id: true,
        recipient: true,
        channel: true,
        status: true,
        sentAt: true,
        readAt: true,
        createdAt: true,
        errorMessage: true,
      },
    }),
    prisma.notificationLog.groupBy({
      by: ["status"],
      where: { recipient: { in: recipients } },
      _count: { _all: true },
    }),
  ]);

  const counts = Object.fromEntries(grouped.map((item) => [item.status, item._count._all]));
  const total = grouped.reduce((sum, item) => sum + item._count._all, 0);

  return {
    total,
    sent: counts.SENT || 0,
    failed: counts.FAILED || 0,
    pending: counts.PENDING || 0,
    read: counts.READ || 0,
    successRate: percent((counts.SENT || 0) + (counts.READ || 0), total),
    latest: logs.map((log) => ({ ...log, sentAt: serializeDate(log.sentAt), readAt: serializeDate(log.readAt), createdAt: serializeDate(log.createdAt), type: "NOTIFICATION" })),
    lastSentAt: serializeDate(latestDate(...logs.map((log) => log.sentAt || log.createdAt))),
  };
}

export async function getCustomerSegmentListAnalytics(segments) {
  const campaigns = await prisma.promotionCampaign.findMany({
    select: { id: true, actionsJson: true },
  }).catch(() => []);

  const targetedCounts = new Map();
  campaigns.forEach((campaign) => {
    getCampaignTargetSegments(campaign).forEach((segment) => {
      targetedCounts.set(segment.id, (targetedCounts.get(segment.id) || 0) + 1);
    });
  });

  const entries = await Promise.all(
    segments.map(async (segment) => {
      const preview = await previewCustomerSegment({ prisma, rulesJson: segment.rulesJson, page: 1, limit: 1 }).catch(() => ({ pagination: { total: 0 } }));
      return [
        segment.id,
        {
          matchedCustomers: preview.pagination?.total || 0,
          rulesCount: rulesCount(segment.rulesJson),
          targetedCampaigns: targetedCounts.get(segment.id) || 0,
        },
      ];
    }),
  );

  return new Map(entries);
}

export async function getCustomerSegmentDetailAnalytics(segment) {
  const [audience, campaigns] = await Promise.all([
    audienceForSegment(segment),
    campaignsForSegment(segment.id),
  ]);
  const recipients = audienceRecipients(audience);
  const [email, notification] = await Promise.all([
    emailStatsForAudience(recipients.emails),
    notificationStatsForAudience(recipients),
  ]);

  const latestSends = [...email.latest, ...notification.latest]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return {
    matchedCustomers: audience.length,
    rulesCount: rulesCount(segment.rulesJson),
    targetedCampaigns: campaigns.length,
    campaigns: campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      slug: campaign.slug,
      status: campaign.status,
    })),
    lastSendAt: serializeDate(latestDate(email.lastSentAt, notification.lastSentAt)),
    email,
    notification,
    latestSends,
  };
}
