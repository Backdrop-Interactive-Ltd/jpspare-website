import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(code, status) {
  return NextResponse.json({ ok: false, code, error: code }, { status });
}

function normalizePhone(value) {
  const raw = String(value || "").trim();
  const compact = raw.replace(/[\s\-().]/g, "");

  if (!compact) return "";
  if (compact.startsWith("+")) return `+${compact.slice(1).replace(/\D/g, "")}`;
  if (compact.startsWith("00")) return `+${compact.slice(2).replace(/\D/g, "")}`;
  if (compact.startsWith("880")) return `+${compact.replace(/\D/g, "")}`;
  if (compact.startsWith("0")) return `+880${compact.slice(1).replace(/\D/g, "")}`;

  return compact.replace(/\D/g, "");
}

function normalizeIdentifier(body) {
  const phoneInput = body.phone || (!body.email && body.identifier && !String(body.identifier).includes("@") ? body.identifier : "");
  const emailInput = body.email || (!phoneInput && body.identifier ? body.identifier : "");

  if (phoneInput) {
    return { channel: "PHONE", identifier: normalizePhone(phoneInput) };
  }

  if (emailInput) {
    return { channel: "EMAIL", identifier: String(emailInput).trim().toLowerCase() };
  }

  return { channel: null, identifier: "" };
}

function isValidIdentifier(channel, identifier) {
  if (channel === "EMAIL") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  }

  if (channel === "PHONE") {
    const digits = identifier.replace(/^\+/, "");
    return /^\+?\d{7,15}$/.test(identifier) && digits.length >= 7 && digits.length <= 15;
  }

  return false;
}

function maskIdentifier(channel, identifier) {
  if (channel === "EMAIL") {
    const [name, domain] = identifier.split("@");
    const safeName = name.length <= 2 ? `${name[0] || "*"}*` : `${name[0]}***${name[name.length - 1]}`;
    return `${safeName}@${domain}`;
  }

  const visible = identifier.slice(-4);
  return `${identifier.slice(0, 4)}******${visible}`;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { channel, identifier } = normalizeIdentifier(body);

    if (!identifier) {
      return jsonError("IDENTIFIER_REQUIRED", 400);
    }

    if (!isValidIdentifier(channel, identifier)) {
      return jsonError("INVALID_IDENTIFIER", 400);
    }

    const customer =
      channel === "PHONE"
        ? await prisma.customer.findUnique({ where: { phone: identifier }, select: { id: true, passwordHash: true, status: true } })
        : await prisma.customer.findUnique({ where: { email: identifier }, select: { id: true, passwordHash: true, status: true } });

    if (customer?.status === "BLOCKED") {
      return jsonError("CUSTOMER_BLOCKED", 403);
    }

    return NextResponse.json({
      ok: true,
      channel,
      identifierMasked: maskIdentifier(channel, identifier),
      passwordLoginRequired: Boolean(customer?.passwordHash),
      otpLoginRequired: !customer?.passwordHash,
      passwordSetupAllowed: !customer?.passwordHash,
    });
  } catch (error) {
    console.error("Login method check failed", { code: error?.code || "LOGIN_METHOD_FAILED", message: error?.message || "Login method check failed" });
    return jsonError("LOGIN_METHOD_FAILED", 500);
  }
}
