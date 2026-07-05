import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { CATALOG_READ_ROLES } from "../../../../../lib/admin/catalogPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const customerId = async (context) => (await context.params).customerId;

function customerName(customer) {
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  return name || "Unnamed customer";
}

function serializeLedger(entry) {
  return {
    id: entry.id,
    type: entry.type,
    points: entry.points,
    balanceAfter: entry.balanceAfter,
    description: entry.description,
    metadata: entry.metadata,
    expiresAt: entry.expiresAt?.toISOString?.() || null,
    createdAt: entry.createdAt?.toISOString?.() || entry.createdAt,
    order: entry.order
      ? {
          id: entry.order.id,
          orderNumber: entry.order.orderNumber,
        }
      : null,
  };
}

function serializeCustomer(customer) {
  const account = customer.loyaltyAccount || null;

  return {
    customer: {
      id: customer.id,
      name: customerName(customer),
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      createdAt: customer.createdAt?.toISOString?.() || customer.createdAt,
    },
    account: account
      ? {
          id: account.id,
          pointsBalance: account.pointsBalance,
          lifetimeEarned: account.lifetimeEarned,
          lifetimeRedeemed: account.lifetimeRedeemed,
          tier: account.tier,
          createdAt: account.createdAt?.toISOString?.() || account.createdAt,
          updatedAt: account.updatedAt?.toISOString?.() || account.updatedAt,
        }
      : null,
    ledger: account?.ledger?.map(serializeLedger) || [],
  };
}

export async function GET(_request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  const customer = await prisma.customer.findUnique({
    where: { id: await customerId(context) },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      loyaltyAccount: {
        select: {
          id: true,
          pointsBalance: true,
          lifetimeEarned: true,
          lifetimeRedeemed: true,
          tier: true,
          createdAt: true,
          updatedAt: true,
          ledger: {
            orderBy: { createdAt: "desc" },
            take: 50,
            select: {
              id: true,
              type: true,
              points: true,
              balanceAfter: true,
              description: true,
              metadata: true,
              expiresAt: true,
              createdAt: true,
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!customer) return apiError("Customer not found.", 404);

  return json(serializeCustomer(customer));
}
