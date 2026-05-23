import { prisma, requireAdminApi, apiError, json } from "../_utils";
import { serializeOrder } from "../../../../lib/commerce/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const READ_ROLES = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER", "SUPPORT_STAFF", "CONTENT_EDITOR"];

export async function GET(request) {
  try {
    await requireAdminApi(READ_ROLES);
    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 15), 1), 50);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status")?.trim();
    const paymentStatus = searchParams.get("paymentStatus")?.trim();

    const where = {
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q, mode: "insensitive" } },
              { customerEmail: { contains: q, mode: "insensitive" } },
              { customerName: { contains: q, mode: "insensitive" } },
              { customerPhone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: true,
          payments: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return json({
      orders: orders.map(serializeOrder),
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
