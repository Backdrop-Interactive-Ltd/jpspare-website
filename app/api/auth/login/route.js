import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setCustomerSession } from "@/lib/auth/customer-session";
import { verifyPassword } from "@/lib/auth/password";
import { getActivePasswordLock, getPasswordAttemptClientInfo, recordFailedPasswordAttempt, resetPasswordAttempts } from "@/lib/auth/password-attempts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(code, status) {
  return NextResponse.json({ ok: false, code, error: code }, { status });
}

function passwordRecoveryRequired(lockedUntil, extra = {}) {
  return NextResponse.json(
    {
      ok: false,
      code: "PASSWORD_RECOVERY_REQUIRED",
      error: "PASSWORD_RECOVERY_REQUIRED",
      message: "Too many incorrect password attempts. Please continue with OTP verification.",
      ...(lockedUntil ? { lockedUntil: lockedUntil.toISOString() } : {}),
      ...extra,
    },
    { status: 423 },
  );
}

function invalidPassword(attemptsRemaining) {
  return NextResponse.json(
    {
      ok: false,
      code: "INVALID_PASSWORD",
      error: "INVALID_PASSWORD",
      message: "Incorrect password.",
      attemptsRemaining,
    },
    { status: 400 },
  );
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

function serializeCustomer(customer) {
  return {
    id: customer.id,
    email: customer.email,
    phone: customer.phone,
    firstName: customer.firstName,
    lastName: customer.lastName,
  };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { channel, identifier } = normalizeIdentifier(body);
    const password = String(body.password || "");

    if (!identifier) {
      return jsonError("IDENTIFIER_REQUIRED", 400);
    }

    if (!password) {
      return jsonError("PASSWORD_REQUIRED", 400);
    }

    if (!isValidIdentifier(channel, identifier)) {
      return jsonError("INVALID_IDENTIFIER", 400);
    }

    const lockedUntil = await getActivePasswordLock(identifier, channel);

    if (lockedUntil) {
      return passwordRecoveryRequired(lockedUntil);
    }

    const customer =
      channel === "PHONE"
        ? await prisma.customer.findUnique({ where: { phone: identifier } })
        : await prisma.customer.findUnique({ where: { email: identifier } });

    if (!customer || !customer.passwordHash) {
      return jsonError("PASSWORD_LOGIN_UNAVAILABLE", 400);
    }

    if (customer.status === "BLOCKED") {
      return jsonError("CUSTOMER_BLOCKED", 403);
    }

    const passwordValid = await verifyPassword(password, customer.passwordHash);

    if (!passwordValid) {
      const attempt = await recordFailedPasswordAttempt({
        identifier,
        channel,
        ...getPasswordAttemptClientInfo(request),
      });

      if (attempt.lockedUntil) {
        return passwordRecoveryRequired(attempt.lockedUntil, { attemptsRemaining: 0 });
      }

      return invalidPassword(attempt.attemptsRemaining);
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
    });

    await resetPasswordAttempts(identifier, channel);
    await setCustomerSession(updatedCustomer);

    return NextResponse.json({
      ok: true,
      customer: serializeCustomer(updatedCustomer),
    });
  } catch (error) {
    console.error("Customer password login failed", { code: error?.code || "PASSWORD_LOGIN_FAILED", message: error?.message || "Customer password login failed" });
    return jsonError("PASSWORD_LOGIN_FAILED", 500);
  }
}
