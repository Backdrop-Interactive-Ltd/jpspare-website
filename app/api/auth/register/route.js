import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { hashPassword } from "../../../../lib/auth/password";
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

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account already exists with this email." }, { status: 409 });
  }

  const customer = await prisma.customer.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      firstName: body.firstName || null,
      lastName: body.lastName || null,
      phone: body.phone || null,
      lastLoginAt: new Date(),
    },
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

