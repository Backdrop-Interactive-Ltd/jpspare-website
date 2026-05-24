import { apiKeyAuthErrorResponse, verifyApiKeyRequest } from "../../../../lib/apiKeyAuth";
import {
  paginationMeta,
  parseBooleanFilter,
  parsePagination,
  parseSyncStatus,
  parseUpdatedSince,
  queryErrorResponse,
  serializeBrand,
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

    const [brands, total] = await prisma.$transaction([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.brand.count({ where }),
    ]);

    return Response.json({
      ok: true,
      data: brands.map(serializeBrand),
      pagination: paginationMeta({ page, limit, total }),
    });
  } catch (error) {
    const authResponse = apiKeyAuthErrorResponse(error);
    if (authResponse.status !== 500) return authResponse;
    console.error("BMS brands lookup failed", error);
    return serverErrorResponse();
  }
}
