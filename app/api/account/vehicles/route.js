import { NextResponse } from "next/server";
import { getCustomerSession } from "../../../../lib/auth/customer-session";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  const vehicles = await prisma.customerVehicle.findMany({
    where: { customerId: customer.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ vehicles });
}

export async function POST(request) {
  const customer = await requireCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body.make || !body.model) {
    return NextResponse.json({ error: "Vehicle make and model are required." }, { status: 400 });
  }

  const isDefault = Boolean(body.isDefault);
  const vehicle = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.customerVehicle.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } });
    }

    return tx.customerVehicle.create({
      data: {
        customerId: customer.id,
        make: body.make,
        model: body.model,
        year: body.year ? Number(body.year) : null,
        chassisCode: body.chassisCode || null,
        engineType: body.engineType || null,
        isDefault,
        source: "WEB",
      },
    });
  });

  return NextResponse.json({ vehicle }, { status: 201 });
}
