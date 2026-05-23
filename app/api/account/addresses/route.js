import { NextResponse } from "next/server";
import { getCustomerSession } from "../../../../lib/auth/customer-session";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeAddress(address) {
  return {
    ...address,
    fullName: [address.firstName, address.lastName].filter(Boolean).join(" "),
  };
}

async function requireCustomer() {
  const session = await getCustomerSession();
  if (!session?.customer) {
    return null;
  }
  return session.customer;
}

export async function GET() {
  const customer = await requireCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const addresses = await prisma.customerAddress.findMany({
    where: { customerId: customer.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ addresses: addresses.map(serializeAddress) });
}

export async function POST(request) {
  const customer = await requireCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const isDefault = Boolean(body.isDefault);

  if (!body.addressLine1) {
    return NextResponse.json({ error: "Address line 1 is required." }, { status: 400 });
  }

  const address = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.customerAddress.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } });
    }

    return tx.customerAddress.create({
      data: {
        customerId: customer.id,
        type: body.type || "SHIPPING",
        firstName: body.firstName || body.fullName?.split(" ")?.[0] || null,
        lastName: body.lastName || body.fullName?.split(" ")?.slice(1).join(" ") || null,
        phone: body.phone || null,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2 || null,
        city: body.city || null,
        zone: body.zone || body.area || null,
        postalCode: body.postalCode || null,
        country: body.country || "Bangladesh",
        isDefault,
        source: "WEB",
      },
    });
  });

  return NextResponse.json({ address: serializeAddress(address) }, { status: 201 });
}
