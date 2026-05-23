import { NextResponse } from "next/server";
import { getCustomerSession } from "../../../../lib/auth/customer-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getCustomerSession();

  if (!session) {
    return NextResponse.json({ customer: null }, { status: 401 });
  }

  const { customer } = session;

  return NextResponse.json({
    customer: {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      addresses: customer.addresses,
      vehicles: customer.vehicles,
    },
  });
}

