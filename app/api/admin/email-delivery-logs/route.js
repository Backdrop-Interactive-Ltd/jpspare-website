import { json, prisma, requireAdminApi } from "../_utils";
import { CATALOG_READ_ROLES } from "../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DELIVERY_STATUSES = new Set(["PENDING", "SENT", "FAILED"]);

function serializeLog(log) {
  if (!log) return null;
  return {
    id: log.id,
    templateId: log.templateId,
    templateName: log.template?.name || null,
    recipientEmail: log.recipientEmail,
    subject: log.subject,
    status: log.status,
    provider: log.provider,
    providerMessageId: log.providerMessageId,
    errorMessage: log.errorMessage,
    sentAt: log.sentAt?.toISOString?.() ?? log.sentAt,
    createdAt: log.createdAt?.toISOString?.() ?? log.createdAt,
    updatedAt: log.updatedAt?.toISOString?.() ?? log.updatedAt,
  };
}

function buildWhere(searchParams) {
  const status = searchParams.get("status") || "";
  const recipientEmail = searchParams.get("recipientEmail")?.trim();

  return {
    ...(status && DELIVERY_STATUSES.has(status) ? { status } : {}),
    ...(recipientEmail ? { recipientEmail: { contains: recipientEmail, mode: "insensitive" } } : {}),
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
    prisma.emailDeliveryLog.findMany({
      where,
      include: { template: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.emailDeliveryLog.count({ where }),
  ]);

  return json({
    items: items.map(serializeLog),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}
