import { apiError, json, prisma, requireAdminApi } from "../../../_utils";
import { CATALOG_MANAGE_ROLES } from "../../../../../../lib/admin/catalogPayload";
import { sendNotificationToSegment } from "../../../../../../lib/customer-segments/send-to-segment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPPORTED_CHANNELS = new Set(["EMAIL", "SMS", "IN_APP"]);
const id = async (context) => (await context.params).id;

function plainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function cleanString(value) {
  return String(value || "").trim();
}

function normalizeChannel(value) {
  const channel = cleanString(value || "IN_APP").toUpperCase();
  return SUPPORTED_CHANNELS.has(channel) ? channel : null;
}

export async function POST(request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const segment = await prisma.customerSegment.findUnique({ where: { id: await id(context) } });
  if (!segment) return apiError("Customer segment not found.", 404);

  const body = await request.json().catch(() => ({}));
  const templateSlug = cleanString(body.templateSlug);
  const channel = normalizeChannel(body.channel);

  if (!templateSlug) return apiError("Notification template slug is required.", 422);
  if (!channel) return apiError("Notification channel must be EMAIL, SMS, or IN_APP.", 422);

  const result = await sendNotificationToSegment({
    segment,
    templateSlug,
    channel,
    variables: plainObject(body.variables),
    actionUrl: cleanString(body.actionUrl) || null,
    limit: body.limit,
  });

  return json({
    ok: true,
    segment: {
      id: segment.id,
      name: segment.name,
      slug: segment.slug,
    },
    templateSlug,
    ...result,
  });
}
