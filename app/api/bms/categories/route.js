import { apiKeyAuthErrorResponse, verifyApiKeyRequest } from "../../../../lib/apiKeyAuth";
import {
  paginationMeta,
  parseBooleanFilter,
  parsePagination,
  parseSyncStatus,
  parseUpdatedSince,
  queryErrorResponse,
  serializeCategory,
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
    const isActive = parseBooleanFilter(searchParams, "isActive");

    const validationError = updatedSince.error || syncStatus.error || isActive.error;
    if (validationError) {
      return queryErrorResponse(validationError);
    }

    const { page, limit, skip } = parsePagination(searchParams, {
      page: 1,
      limit: 100,
      maxLimit: 200,
    });

    const where = {
      ...(updatedSince.value ? { updatedAt: { gte: updatedSince.value } } : {}),
      ...(syncStatus.value ? { syncStatus: syncStatus.value } : {}),
      ...(isActive.value !== null ? { isActive: isActive.value } : {}),
    };

    const [categories, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          parent: {
            select: {
              id: true,
              externalId: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.category.count({ where }),
    ]);

    return Response.json({
      ok: true,
      data: categories.map(serializeCategory),
      pagination: paginationMeta({ page, limit, total }),
    });
  } catch (error) {
    const authResponse = apiKeyAuthErrorResponse(error);
    if (authResponse.status !== 500) return authResponse;
    console.error("BMS categories lookup failed", {
      message: error?.message,
      code: error?.code,
    });
    return serverErrorResponse();
  }
}
