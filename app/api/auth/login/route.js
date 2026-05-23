import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { verifyPassword } from "../../../../lib/auth/password";
import { setCustomerSession } from "../../../../lib/auth/customer-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { email } });
  const isValid = customer ? await verifyPassword(password, customer.passwordHash) : false;

  if (!customer || !isValid || customer.status !== "ACTIVE") {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: { lastLoginAt: new Date() },
  });
  await setCustomerSession(customer);

  return NextResponse.json({
    customer: {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
    },
  });
}

