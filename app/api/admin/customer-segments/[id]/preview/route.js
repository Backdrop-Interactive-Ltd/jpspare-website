import { apiError, json, prisma, requireAdminApi } from "../../../_utils";
import { CATALOG_READ_ROLES } from "../../../../../../lib/admin/catalogPayload";
import { previewCustomerSegment } from "../../../../../../lib/customer-segments/preview";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const id = async (context) => (await context.params).id;

function serializeSegment(segment) {
  if (!segment) return null;
  return {
    id: segment.id,
    name: segment.name,
    slug: segment.slug,
    description: segment.description,
    isActive: segment.isActive,
    lastEvaluatedAt: segment.lastEvaluatedAt?.toISOString?.() ?? segment.lastEvaluatedAt,
    createdAt: segment.createdAt?.toISOString?.() ?? segment.createdAt,
    updatedAt: segment.updatedAt?.toISOString?.() ?? segment.updatedAt,
  };
}

export async function GET(request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const segment = await prisma.customerSegment.findUnique({ where: { id: await id(context) } });
  if (!segment) return apiError("Customer segment not found.", 404);

  const { searchParams } = new URL(request.url);
  const preview = await previewCustomerSegment({
    prisma,
    rulesJson: segment.rulesJson,
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
  });

  return json({
    segment: serializeSegment(segment),
    ...preview,
  });
}
