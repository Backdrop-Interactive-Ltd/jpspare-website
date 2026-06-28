import { json, prisma, requireAdminApi } from "../_utils";
import {
  OTP_PROVIDER_READ_ROLES,
  OTP_PROVIDER_WRITE_ROLES,
  normalizeOtpProviderPayload,
  serializeOtpProvider,
} from "../../../../lib/admin/otp-provider-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function otpProviderError(code, message, status = 400) {
  return json({ ok: false, code, message }, status);
}

export async function GET() {
  const auth = await requireAdminApi(OTP_PROVIDER_READ_ROLES);
  if (auth.response) return auth.response;

  const items = await prisma.otpProvider.findMany({
    orderBy: [{ channel: "asc" }, { isDefault: "desc" }, { createdAt: "desc" }],
  });

  return json({ items: items.map(serializeOtpProvider) });
}

export async function POST(request) {
  const auth = await requireAdminApi(OTP_PROVIDER_WRITE_ROLES);
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  const normalized = normalizeOtpProviderPayload(body);

  if (normalized.secretError) {
    return otpProviderError("OTP_PROVIDER_SECRET_ERROR", "OTP provider secret encryption is not configured.", 500);
  }

  if (normalized.error) {
    return otpProviderError("INVALID_OTP_PROVIDER", normalized.error);
  }

  const item = await prisma.$transaction(async (tx) => {
    if (normalized.isDefault) {
      await tx.otpProvider.updateMany({
        where: { channel: normalized.channel },
        data: { isDefault: false },
      });
    }

    return tx.otpProvider.create({ data: normalized.data });
  });

  return json({ item: serializeOtpProvider(item) }, 201);
}
