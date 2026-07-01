import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { setCustomerSession } from "../../../../lib/auth/customer-session";
import { hashPassword } from "../../../../lib/auth/password";
import { resetPasswordAttempts } from "../../../../lib/auth/password-attempts";

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
    return {
      channel: "PHONE",
      identifier: normalizePhone(phoneInput),
    };
  }

  if (emailInput) {
    return {
      channel: "EMAIL",
      identifier: String(emailInput).trim().toLowerCase(),
    };
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

function isValidOtp(otp) {
  return /^\d{6}$/.test(otp);
}

function isValidOptionalPassword(password) {
  return !password || password.length >= 6;
}

function verifyOtpHash(otp, storedHash) {
  const [salt, hash] = String(storedHash || "").split(":");

  if (!salt || !hash) {
    return false;
  }

  const candidate = crypto.pbkdf2Sync(otp, salt, 120000, 32, "sha256").toString("hex");
  const hashBuffer = Buffer.from(hash, "hex");
  const candidateBuffer = Buffer.from(candidate, "hex");

  if (hashBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBuffer, candidateBuffer);
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

function getProfileComplete(customer) {
  const hasName = Boolean(String(customer.firstName || "").trim() || String(customer.lastName || "").trim());
  const hasPhone = Boolean(String(customer.phone || "").trim());
  return hasName && hasPhone;
}

async function findOrCreateCustomer(channel, identifier) {
  const existingCustomer =
    channel === "PHONE"
      ? await prisma.customer.findUnique({ where: { phone: identifier } })
      : await prisma.customer.findUnique({ where: { email: identifier } });

  if (existingCustomer) {
    return existingCustomer;
  }

  return prisma.customer.create({
    data:
      channel === "PHONE"
        ? { phone: identifier, email: null, passwordHash: null }
        : { email: identifier, phone: null, passwordHash: null },
  });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { channel, identifier } = normalizeIdentifier(body);
    const otp = String(body.otp || "").trim();
    const password = String(body.password || "").trim();
    const resetPassword = Boolean(body.resetPassword);

    if (!identifier) {
      return jsonError("IDENTIFIER_REQUIRED", 400);
    }

    if (!otp) {
      return jsonError("OTP_REQUIRED", 400);
    }

    if (!isValidIdentifier(channel, identifier)) {
      return jsonError("INVALID_IDENTIFIER", 400);
    }

    if (!isValidOtp(otp)) {
      return jsonError("INVALID_OTP", 400);
    }

    if (!isValidOptionalPassword(password)) {
      return jsonError("INVALID_PASSWORD", 400);
    }

    const otpRecord = await prisma.customerOtp.findFirst({
      where: {
        identifier,
        channel,
        usedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return jsonError("OTP_NOT_FOUND", 400);
    }

    if (otpRecord.expiresAt.getTime() <= Date.now()) {
      return jsonError("OTP_EXPIRED", 400);
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return jsonError("OTP_ATTEMPTS_EXCEEDED", 429);
    }

    if (!verifyOtpHash(otp, otpRecord.otpHash)) {
      await prisma.customerOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });

      return jsonError("INVALID_OTP", 400);
    }

    const customer = await findOrCreateCustomer(channel, identifier);

    if (customer.status === "BLOCKED") {
      await prisma.customerOtp.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
      });

      return jsonError("CUSTOMER_BLOCKED", 403);
    }

    const shouldSetPassword = Boolean(password && (!customer.passwordHash || resetPassword));
    const passwordHash = shouldSetPassword ? await hashPassword(password) : null;

    await prisma.$transaction([
      prisma.customerOtp.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
      }),
      resetPasswordAttempts(identifier, channel),
      prisma.customer.update({
        where: { id: customer.id },
        data: {
          lastLoginAt: new Date(),
          ...(shouldSetPassword ? { passwordHash } : {}),
        },
      }),
    ]);

    const refreshedCustomer = await prisma.customer.findUniqueOrThrow({
      where: { id: customer.id },
    });

    await setCustomerSession(refreshedCustomer);

    return NextResponse.json({
      ok: true,
      customer: serializeCustomer(refreshedCustomer),
      profileComplete: getProfileComplete(refreshedCustomer),
    });
  } catch (error) {
    console.error("OTP verify failed", {
      message: error?.message,
      code: error?.code,
    });
    return jsonError("OTP_VERIFY_FAILED", 500);
  }
}
