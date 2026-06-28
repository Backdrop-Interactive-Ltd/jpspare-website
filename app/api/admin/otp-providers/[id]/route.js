import { json, prisma, requireAdminApi } from "../../_utils";
import {
  OTP_PROVIDER_WRITE_ROLES,
  normalizeOtpProviderPayload,
  serializeOtpProvider,
} from "../../../../../lib/admin/otp-provider-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getId = async (context) => (await context.params).id;

function otpProviderError(code, message, status = 400) {
  return json({ ok: false, code, message }, status);
}

export async function PATCH(request, context) {
  const auth = await requireAdminApi(OTP_PROVIDER_WRITE_ROLES);
  if (auth.response) return auth.response;

  const providerId = await getId(context);
  const existing = await prisma.otpProvider.findUnique({ where: { id: providerId } });

  if (!existing) {
    return otpProviderError("OTP_PROVIDER_NOT_FOUND", "OTP provider not found.", 404);
  }

  const body = await request.json().catch(() => ({}));
  const normalized = normalizeOtpProviderPayload(body, existing);

  if (normalized.secretError) {
    return otpProviderError("OTP_PROVIDER_SECRET_ERROR", "OTP provider secret encryption is not configured.", 500);
  }

  if (normalized.error) {
    return otpProviderError("INVALID_OTP_PROVIDER", normalized.error);
  }

  const item = await prisma.$transaction(async (tx) => {
    if (normalized.isDefault) {
      await tx.otpProvider.updateMany({
        where: {
          channel: normalized.channel,
          id: { not: providerId },
        },
        data: { isDefault: false },
      });
    }

    return tx.otpProvider.update({
      where: { id: providerId },
      data: normalized.data,
    });
  });

  return json({ item: serializeOtpProvider(item) });
}
