import { apiError, json, prisma, requireAdminApi } from "../_utils";
import {
  CATALOG_MANAGE_ROLES,
  CATALOG_READ_ROLES,
  categoryInclude,
  normalizeCategoryPayload,
  replaceCategoryImages,
  serializeCategory,
  validateNamedPayload,
} from "../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const parentId = searchParams.get("parentId") || "";
  const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1), 100);

  const where = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status === "active" ? { isActive: true } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
    ...(parentId ? { parentId: parentId === "root" ? null : parentId } : {}),
  };

  const [itemsRaw, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      include: categoryInclude(),
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.category.count({ where }),
  ]);

  return json({
    items: itemsRaw.map(serializeCategory),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

export async function POST(request) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeCategoryPayload(await request.json());
  const error = validateNamedPayload(payload.category, "Category");
  if (error) return apiError(error, 422);

  const item = await prisma.$transaction(async (tx) => {
    const category = await tx.category.create({ data: payload.category });
    await replaceCategoryImages(tx, category.id, payload.images);
    return tx.category.findUnique({ where: { id: category.id }, include: categoryInclude() });
  });

  return json({ item: serializeCategory(item) }, 201);
}
