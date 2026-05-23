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

  const existing = await prisma.customerAddress.findFirst({ where: { id, customerId: customer.id } });
  if (!existing) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  const isDefault = body.isDefault === undefined ? existing.isDefault : Boolean(body.isDefault);

  const address = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.customerAddress.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } });
    }

    return tx.customerAddress.update({
      where: { id },
      data: {
        type: body.type || existing.type,
        firstName: body.firstName ?? existing.firstName,
        lastName: body.lastName ?? existing.lastName,
        phone: body.phone ?? existing.phone,
        addressLine1: body.addressLine1 ?? existing.addressLine1,
        addressLine2: body.addressLine2 ?? existing.addressLine2,
        city: body.city ?? existing.city,
        zone: body.zone ?? body.area ?? existing.zone,
        postalCode: body.postalCode ?? existing.postalCode,
        country: body.country ?? existing.country,
        isDefault,
      },
    });
  });

  return NextResponse.json({ address });
}

export async function DELETE(_request, { params }) {
  const customer = await requireCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.customerAddress.deleteMany({ where: { id, customerId: customer.id } });
  return NextResponse.json({ ok: true });
}
