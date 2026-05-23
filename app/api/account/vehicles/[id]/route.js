import { NextResponse } from "next/server";
import { getCustomerSession } from "../../../../../lib/auth/customer-session";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireCustomer() {
  const session = await getCustomerSession();
  if (!session?.customer) {
    return null;
  }
  return session.customer;
}

export async function PATCH(request, { params }) {
  const customer = await requireCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const existing = await prisma.customerVehicle.findFirst({ where: { id, customerId: customer.id } });
  if (!existing) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  const isDefault = body.isDefault === undefined ? existing.isDefault : Boolean(body.isDefault);
  const vehicle = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.customerVehicle.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } });
    }

    return tx.customerVehicle.update({
      where: { id },
      data: {
        make: body.make ?? existing.make,
        model: body.model ?? existing.model,
        year: body.year === undefined ? existing.year : body.year ? Number(body.year) : null,
        chassisCode: body.chassisCode ?? existing.chassisCode,
        engineType: body.engineType ?? existing.engineType,
        isDefault,
      },
    });
  });

  return NextResponse.json({ vehicle });
}

export async function DELETE(_request, { params }) {
  const customer = await requireCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.customerVehicle.deleteMany({ where: { id, customerId: customer.id } });
  return NextResponse.json({ ok: true });
}
