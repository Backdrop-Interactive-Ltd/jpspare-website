import crypto from "crypto";
import { json, prisma, requireAdminApi } from "../../../_utils";
import { OTP_PROVIDER_WRITE_ROLES } from "../../../../../../lib/admin/otp-provider-response";
import { renderOtpTemplate, sendEmailOtp, sendSmsOtp } from "../../../../../../lib/auth/otp-delivery";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getId = async (context) => (await context.params).id;

function otpTestError(code, message, status = 400) {
  return json({ ok: false, code, message }, status);
}

function generateTestOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function getTestOtp(value) {
  const otp = String(value || "").trim();
  if (!otp) return generateTestOtp();
  if (/^\d{4,8}$/.test(otp)) return otp;
  return null;
}

function normalizePhone(value) {
  const compact = String(value || "")
    .trim()
    .replace(/[\s().-]/g, "");

  if (!compact) return "";
  if (compact.startsWith("+")) return `+${compact.slice(1).replace(/\D/g, "")}`;
  if (compact.startsWith("00")) return `+${compact.slice(2).replace(/\D/g, "")}`;
  if (compact.startsWith("880")) return `+${compact.replace(/\D/g, "")}`;
  if (compact.startsWith("0")) return `+880${compact.slice(1).replace(/\D/g, "")}`;
  return compact.replace(/\D/g, "");
}

function normalizeIdentifier(channel, value) {
  if (channel === "EMAIL") return String(value || "").trim().toLowerCase();
  return normalizePhone(value);
}

function isValidIdentifier(channel, identifier) {
  if (channel === "EMAIL") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  if (channel === "PHONE") {
    const digits = identifier.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15;
  }
  return false;
}

function maskIdentifier(channel, identifier) {
  if (channel === "EMAIL") {
    const [localPart, domain] = String(identifier).split("@");
    const firstLetter = localPart?.charAt(0) || "*";
    return `${firstLetter}***@${domain || ""}`;
  }

  return `\u2022\u2022\u2022\u2022\u2022\u2022${String(identifier).slice(-4)}`;
}

function safeDeliveryError(error) {
  const code = error?.code || "OTP_PROVIDER_TEST_FAILED";

  if (code === "OTP_EMAIL_DRIVER_MISSING") {
    return { code, message: "SMTP email driver is not installed.", status: 501 };
  }

  if (code === "OTP_PROVIDER_TYPE_UNSUPPORTED") {
    return { code, message: "OTP provider type is unsupported.", status: 400 };
  }

  if (code === "OTP_SMS_DELIVERY_FAILED") {
    return { code, message: "OTP SMS test delivery failed.", status: 502 };
  }

  if (code === "OTP_SMS_PROVIDER_INVALID" || code === "OTP_EMAIL_PROVIDER_INVALID") {
    return { code, message: "OTP provider configuration is incomplete.", status: 400 };
  }

  return { code: "OTP_PROVIDER_TEST_FAILED", message: "OTP test delivery failed.", status: 500 };
}

export async function POST(request, context) {
  const auth = await requireAdminApi(OTP_PROVIDER_WRITE_ROLES);
  if (auth.response) return auth.response;

  const providerId = await getId(context);
  const provider = await prisma.otpProvider.findUnique({ where: { id: providerId } });

  if (!provider) {
    return otpTestError("OTP_PROVIDER_NOT_FOUND", "OTP provider not found.", 404);
  }

  if (!provider.isActive) {
    return otpTestError("OTP_PROVIDER_INACTIVE", "OTP provider is inactive.");
  }

  if (provider.channel !== "PHONE" && provider.channel !== "EMAIL") {
    return otpTestError("OTP_PROVIDER_TYPE_UNSUPPORTED", "OTP provider channel is unsupported.");
  }

  const body = await request.json().catch(() => ({}));
  const identifier = normalizeIdentifier(provider.channel, body.identifier);

  if (!identifier || !isValidIdentifier(provider.channel, identifier)) {
    return otpTestError("INVALID_TEST_IDENTIFIER", "Please provide a valid test identifier.");
  }

  const otp = getTestOtp(body.otp);
  if (!otp) {
    return otpTestError("INVALID_TEST_OTP", "Test OTP must be a 4 to 8 digit code.");
  }

  const template = await renderOtpTemplate({
    channel: provider.channel,
    otp,
    identifier,
    provider,
  });

  try {
    if (provider.channel === "PHONE" && provider.providerType === "GENERIC_HTTP") {
      await sendSmsOtp({ provider, identifier, otp, message: template.message });
    } else if (provider.channel === "EMAIL" && provider.providerType === "SMTP") {
      await sendEmailOtp({
        provider,
        identifier,
        otp,
        subject: template.subject,
        message: template.message,
      });
    } else {
      return otpTestError("OTP_PROVIDER_TYPE_UNSUPPORTED", "OTP provider type is unsupported.");
    }
  } catch (error) {
    const safeError = safeDeliveryError(error);
    return otpTestError(safeError.code, safeError.message, safeError.status);
  }

  return json({
    ok: true,
    message: "OTP test delivery sent.",
    channel: provider.channel,
    providerId: provider.id,
    providerName: provider.name,
    identifierMasked: maskIdentifier(provider.channel, identifier),
  });
}
