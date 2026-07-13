import { apiError, json, prisma, requireAdminApi } from "../_utils";
import { normalizeProductPayload, PRODUCT_READ_ROLES, PRODUCT_WRITE_ROLES, productInclude, replaceProductRelations, serializeProduct, validateProductPayload } from "../../../../lib/admin/productPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TOP_SELLING_ORDER_STATUSES = ["DELIVERED"];

function stockStatusForFilter(filter) {
  if (filter === "low-stock") return "LOW_STOCK";
  if (filter === "out-of-stock") return "OUT_OF_STOCK";
  return null;
}

function isTopSellingSort(sort) {
  return sort === "top-selling";
}

function buildWhere(searchParams) {
  const query = searchParams.get("q")?.trim();
  const categoryId = searchParams.get("categoryId") || undefined;
  const brandId = searchParams.get("brandId") || undefined;
  const status = searchParams.get("status") || undefined;
  const stockStatus = stockStatusForFilter(searchParams.get("filter"));

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
    ...(categoryId ? { categoryId } : {}),
    ...(brandId ? { brandId } : {}),
    ...(status && status !== "ALL" ? { status } : { status: { not: "ARCHIVED" } }),
    ...(stockStatus ? { stockStatus } : {}),
  };
}

async function getTopSellingProducts({ where, page, limit }) {
  const salesWhere = {
    productId: { not: null },
    order: { status: { in: TOP_SELLING_ORDER_STATUSES } },
    product: { is: where },
  };

  const [groups, allGroups] = await prisma.$transaction([
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: salesWhere,
      _sum: { quantity: true },
      orderBy: [{ _sum: { quantity: "desc" } }, { productId: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: salesWhere,
    }),
  ]);

  const productIds = groups.map((group) => group.productId).filter(Boolean);
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: productInclude(),
      })
    : [];
  const productById = new Map(products.map((product) => [product.id, product]));
  const soldById = new Map(groups.map((group) => [group.productId, Number(group._sum.quantity || 0)]));
  const items = productIds
    .map((productId) => productById.get(productId))
    .filter(Boolean)
    .map((product) => ({ ...serializeProduct(product), totalSold: soldById.get(product.id) || 0 }));

  return { items, total: allGroups.length };
}

export async function GET(request) {
  const auth = await requireAdminApi(PRODUCT_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "12", 10), 1), 100);
  const where = buildWhere(searchParams);

  const result = isTopSellingSort(searchParams.get("sort"))
    ? await getTopSellingProducts({ where, page, limit })
    : await prisma.$transaction([
        prisma.product.findMany({
          where,
          include: productInclude(),
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]).then(([items, total]) => ({ items: items.map(serializeProduct), total }));

  return json({
    items: result.items,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.max(Math.ceil(result.total / limit), 1),
    },
  });
}

export async function POST(request) {
  const auth = await requireAdminApi(PRODUCT_WRITE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeProductPayload(await request.json());
  const validationError = validateProductPayload(payload);
  if (validationError) return apiError(validationError, 422);

  const item = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({ data: payload.product });
    await replaceProductRelations(tx, product.id, payload);
    return tx.product.findUnique({ where: { id: product.id }, include: productInclude() });
  });

  return json({ item: serializeProduct(item) }, 201);
}
