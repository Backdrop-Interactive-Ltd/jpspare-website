import { json, prisma, requireAdminApi } from "../_utils";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NOTIFICATION_STATUSES = new Set(["PENDING", "SENT", "FAILED", "READ"]);
const NOTIFICATION_CHANNELS = new Set(["EMAIL", "SMS", "IN_APP", "PUSH"]);

function serializeLog(log) {
  if (!log) return null;
  return {
    id: log.id,
    templateId: log.templateId,
    templateName: log.template?.name || null,
    templateSlug: log.template?.slug || null,
    recipient: log.recipient,
    channel: log.channel,
    status: log.status,
    provider: log.provider,
    providerMessageId: log.providerMessageId,
    errorMessage: log.errorMessage,
    sentAt: log.sentAt?.toISOString?.() ?? log.sentAt,
    readAt: log.readAt?.toISOString?.() ?? log.readAt,
    createdAt: log.createdAt?.toISOString?.() ?? log.createdAt,
    updatedAt: log.updatedAt?.toISOString?.() ?? log.updatedAt,
  };
}

function buildWhere(searchParams) {
  const status = searchParams.get("status") || "";
  const channel = searchParams.get("channel") || "";
  const recipient = searchParams.get("recipient")?.trim();

  return {
    ...(status && NOTIFICATION_STATUSES.has(status) ? { status } : {}),
    ...(channel && NOTIFICATION_CHANNELS.has(channel) ? { channel } : {}),
    ...(recipient ? { recipient: { contains: recipient, mode: "insensitive" } } : {}),
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);
  const where = buildWhere(searchParams);

  const [items, total] = await prisma.$transaction([
    prisma.notificationLog.findMany({
      where,
      include: { template: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notificationLog.count({ where }),
  ]);
  const [statusRows, channelRows, providerRows] = await Promise.all([
    prisma.notificationLog.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    }),
    prisma.notificationLog.groupBy({
      by: ["channel"],
      where,
      _count: { _all: true },
    }),
    prisma.notificationLog.groupBy({
      by: ["provider"],
      where,
      _count: { _all: true },
    }),
  ]);
  const countsByStatus = Object.fromEntries(statusRows.map((row) => [row.status, row._count._all]));
  const sent = countsByStatus.SENT || 0;
  const failed = countsByStatus.FAILED || 0;
  const pending = countsByStatus.PENDING || 0;
  const read = countsByStatus.READ || 0;
  const attempts = sent + failed + pending + read;

  return json({
    items: items.map(serializeLog),
    analytics: {
      totalNotifications: total,
      sentCount: sent,
      failedCount: failed,
      pendingCount: pending,
      readCount: read,
      successRate: attempts ? Math.round(((sent + read) / attempts) * 100) : 0,
      channelBreakdown: channelRows.map((row) => ({
        channel: row.channel,
        count: row._count._all,
      })),
      providerBreakdown: providerRows.map((row) => ({
        provider: row.provider || "Not recorded",
        count: row._count._all,
      })),
    },
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}
