import { apiKeyAuthErrorResponse, verifyApiKeyRequest } from "../../../../lib/apiKeyAuth";
import {
  paginationMeta,
  parsePagination,
  parseProductStatus,
  parseSyncStatus,
  parseUpdatedSince,
  queryErrorResponse,
  serializeProduct,
  serverErrorResponse,
} from "../../../../lib/bmsLookup";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  try {
    await verifyApiKeyRequest(request);

    const { searchParams } = new URL(request.url);
    const updatedSince = parseUpdatedSince(searchParams);
    const syncStatus = parseSyncStatus(searchParams);
    const productStatus = parseProductStatus(searchParams);

    const validationError = updatedSince.error || syncStatus.error || productStatus.error;
    if (validationError) {
      return queryErrorResponse(validationError);
    }

    const { page, limit, skip } = parsePagination(searchParams, {
      page: 1,
      limit: 50,
      maxLimit: 100,
    });
    const q = (searchParams.get("q") || "").trim();

    const where = {
      ...(updatedSince.value ? { updatedAt: { gte: updatedSince.value } } : {}),
      ...(syncStatus.value ? { syncStatus: syncStatus.value } : {}),
      ...(productStatus.value ? { status: productStatus.value } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          category: {
            select: {
              id: true,
              externalId: true,
              name: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              externalId: true,
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
            take: 1,
            select: {
              id: true,
              url: true,
              alt: true,
              source: true,
            },
          },
          media: {
            orderBy: { sortOrder: "asc" },
            take: 1,
            include: {
              media: {
                select: {
                  id: true,
                  url: true,
                  alt: true,
                  fileName: true,
                  filename: true,
                },
              },
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return Response.json({
      ok: true,
      data: products.map(serializeProduct),
      pagination: paginationMeta({ page, limit, total }),
    });
  } catch (error) {
    const authResponse = apiKeyAuthErrorResponse(error);
    if (authResponse.status !== 500) return authResponse;
    console.error("BMS products lookup failed", error);
    return serverErrorResponse();
  }
}
