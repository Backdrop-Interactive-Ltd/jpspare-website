import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { sendPasswordResetEmail } from "../../../../lib/email/auth-emails";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || body.identifier || "").trim().toLowerCase();

  if (isValidEmail(email)) {
    const customer = await prisma.customer.findUnique({ where: { email } }).catch(() => null);
    if (customer) {
      await sendPasswordResetEmail(customer, request);
    }
  }

  return NextResponse.json({
    ok: true,
    message: "If the email exists, a reset link will be sent. Email provider integration is ready for production setup.",
  });
}
