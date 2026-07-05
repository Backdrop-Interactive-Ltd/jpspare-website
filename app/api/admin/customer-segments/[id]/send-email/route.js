import { apiError, json, prisma, requireAdminApi } from "../../../_utils";
import { CATALOG_MANAGE_ROLES } from "../../../../../../lib/admin/catalogPayload";
import { sendEmailToSegment } from "../../../../../../lib/customer-segments/send-to-segment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const id = async (context) => (await context.params).id;

function plainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function cleanString(value) {
  return String(value || "").trim();
}

export async function POST(request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const segment = await prisma.customerSegment.findUnique({ where: { id: await id(context) } });
  if (!segment) return apiError("Customer segment not found.", 404);

  const body = await request.json().catch(() => ({}));
  const templateSlug = cleanString(body.templateSlug);
  if (!templateSlug) return apiError("Email template slug is required.", 422);

  const result = await sendEmailToSegment({
    segment,
    templateSlug,
    variables: plainObject(body.variables),
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
