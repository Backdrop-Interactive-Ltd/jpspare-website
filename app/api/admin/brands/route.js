import { apiError, json, prisma, requireAdminApi } from "../_utils";
import {
  CATALOG_MANAGE_ROLES,
  CATALOG_READ_ROLES,
  brandInclude,
  normalizeBrandPayload,
  serializeBrand,
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
  const featured = searchParams.get("featured") || "";
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
    ...(featured === "true" ? { isFeatured: true } : {}),
  };

  const [itemsRaw, total] = await prisma.$transaction([
    prisma.brand.findMany({
      where,
      include: brandInclude(),
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.brand.count({ where }),
  ]);

  return json({
    items: itemsRaw.map(serializeBrand),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

export async function POST(request) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const payload = normalizeBrandPayload(await request.json());
  const error = validateNamedPayload(payload.brand, "Brand");
  if (error) return apiError(error, 422);

  const item = await prisma.brand.create({ data: payload.brand, include: brandInclude() });
  return json({ item: serializeBrand(item) }, 201);
}
