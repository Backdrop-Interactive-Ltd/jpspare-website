import { prisma, requireAdminApi } from "../../_utils";
import { PRODUCT_READ_ROLES } from "../../../../../lib/admin/productPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EXPORT_LIMIT = 10000;

function stockStatusForFilter(filter) {
  if (filter === "low-stock") return "LOW_STOCK";
  if (filter === "out-of-stock") return "OUT_OF_STOCK";
  return null;
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

function csvCell(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function csvRow(values) {
  return values.map(csvCell).join(",");
}

function decimalString(value) {
  return value?.toString?.() ?? value ?? "";
}

function dateString(value) {
  return value?.toISOString?.() ?? "";
}

function buildFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `jpspare-products-${date}.csv`;
}

export async function GET(request) {
  const auth = await requireAdminApi(PRODUCT_READ_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const where = buildWhere(searchParams);
  const products = await prisma.product.findMany({
    where,
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: [{ createdAt: "desc" }, { title: "asc" }],
    take: EXPORT_LIMIT,
  });

  const header = [
    "SKU",
    "Name",
    "Slug",
    "Brand",
    "Category",
    "Product Type",
    "Price",
    "Compare Price",
    "Stock Quantity",
    "Stock Status",
    "Product Status",
    "Featured",
    "Created Date",
  ];

  const rows = products.map((product) =>
    csvRow([
      product.sku,
      product.title,
      product.slug,
      product.brand?.name,
      product.category?.name,
      "",
      decimalString(product.price),
      decimalString(product.compareAtPrice),
      product.stockQuantity,
      product.stockStatus,
      product.status,
      product.isFeatured ? "Yes" : "No",
      dateString(product.createdAt),
    ]),
  );
  const csv = `\uFEFF${[csvRow(header), ...rows].join("\n")}\n`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${buildFilename()}"`,
      "Cache-Control": "no-store",
    },
  });
}
