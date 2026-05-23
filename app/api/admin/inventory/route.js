import { apiError, json, prisma, requireAdminApi } from "../_utils";
import { INVENTORY_READ_ROLES, serializeInventoryProduct, STOCK_STATUSES } from "../../../../lib/commerce/inventory";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildWhere(searchParams) {
  const query = searchParams.get("q")?.trim();
  const status = searchParams.get("status") || "";

  return {
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
            { barcode: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status && status !== "ALL" && STOCK_STATUSES.includes(status) ? { stockStatus: status } : {}),
  };
}

export async function GET(request) {
  const auth = await requireAdminApi(INVENTORY_READ_ROLES);
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const where = buildWhere(searchParams);

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          images: { orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }], take: 1 },
          media: { include: { media: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        },
        orderBy: [{ stockStatus: "asc" }, { updatedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return json({
      items: items.map(serializeInventoryProduct),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    return apiError(error.message || "Failed to load inventory.", 500);
  }
}
