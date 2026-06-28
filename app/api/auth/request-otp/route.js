import crypto from "crypto";
import { NextResponse } from "next/server";
import { sendOtp } from "@/lib/auth/otp-delivery";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const OTP_EXPIRY_SECONDS = 5 * 60;
const OTP_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

function jsonError(code, status) {
  return NextResponse.json({ ok: false, code, error: code }, { status });
}

function safeErrorCode(error, fallback) {
  return error?.code || fallback;
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

function maskIdentifier(channel, identifier) {
  if (channel === "EMAIL") {
    const [name, domain] = identifier.split("@");
    const safeName = name.length <= 2 ? `${name[0] || "*"}*` : `${name[0]}***${name[name.length - 1]}`;
    return `${safeName}@${domain}`;
  }

  const visible = identifier.slice(-4);
  return `${identifier.slice(0, 4)}******${visible}`;
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOtp(otp) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(otp, salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
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

    const cooldownSince = new Date(Date.now() - OTP_COOLDOWN_SECONDS * 1000);
    const recentOtp = await prisma.customerOtp.findFirst({
      where: {
        identifier,
        channel,
        usedAt: null,
        createdAt: { gte: cooldownSince },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentOtp) {
      const elapsedSeconds = Math.floor((Date.now() - recentOtp.createdAt.getTime()) / 1000);
      const retryAfterSeconds = Math.max(1, OTP_COOLDOWN_SECONDS - elapsedSeconds);

      return NextResponse.json(
        {
          ok: false,
          code: "OTP_COOLDOWN",
          error: "OTP_COOLDOWN",
          retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

    const otpRecord = await prisma.customerOtp.create({
      data: {
        identifier,
        channel,
        otpHash: hashOtp(otp),
        expiresAt,
        maxAttempts: OTP_MAX_ATTEMPTS,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
        userAgent: request.headers.get("user-agent") || null,
      },
    });

    let deliverySkipped = false;
    let deliveryErrorCode = null;

    try {
      await sendOtp({ channel, identifier, otp });
    } catch (deliveryError) {
      deliveryErrorCode = safeErrorCode(deliveryError, channel === "PHONE" ? "OTP_SMS_DELIVERY_FAILED" : "OTP_EMAIL_DELIVERY_FAILED");

      if (process.env.NODE_ENV === "production") {
        await prisma.customerOtp.update({
          where: { id: otpRecord.id },
          data: { usedAt: new Date() },
        });

        return NextResponse.json(
          {
            ok: false,
            error: "OTP_DELIVERY_FAILED",
            code: deliveryErrorCode,
          },
          { status: deliveryErrorCode === "OTP_PROVIDER_NOT_CONFIGURED" ? 503 : 500 }
        );
      }

      deliverySkipped = true;
    }

    return NextResponse.json({
      ok: true,
      message: "OTP sent successfully.",
      channel,
      identifierMasked: maskIdentifier(channel, identifier),
      expiresInSeconds: OTP_EXPIRY_SECONDS,
      resendAfterSeconds: OTP_COOLDOWN_SECONDS,
      ...(process.env.NODE_ENV !== "production" && deliverySkipped
        ? { devOtp: otp, deliverySkipped, ...(deliveryErrorCode ? { deliveryErrorCode } : {}) }
        : {}),
    });
  } catch (error) {
    console.error("OTP request failed", { code: error?.code || "OTP_REQUEST_FAILED", message: error?.message || "OTP request failed" });
    return jsonError("OTP_REQUEST_FAILED", 500);
  }
}
