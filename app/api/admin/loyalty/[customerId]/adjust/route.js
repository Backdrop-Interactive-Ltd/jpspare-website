import { apiError, json, requireAdminApi } from "../../../_utils";
import { CATALOG_MANAGE_ROLES } from "../../../../../../lib/admin/catalogPayload";
import { adjustLoyaltyPoints, normalizeLoyaltyAdjustmentPayload, validateLoyaltyAdjustment } from "../../../../../../lib/loyalty/adjust-points";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const customerId = async (context) => (await context.params).customerId;

function serializeResult(result) {
  return {
    account: {
      ...result.account,
      createdAt: result.account.createdAt?.toISOString?.() || result.account.createdAt,
      updatedAt: result.account.updatedAt?.toISOString?.() || result.account.updatedAt,
    },
    ledger: {
      ...result.ledger,
      createdAt: result.ledger.createdAt?.toISOString?.() || result.ledger.createdAt,
      expiresAt: result.ledger.expiresAt?.toISOString?.() || null,
    },
  };
}

export async function POST(request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  let payload;
  try {
    payload = normalizeLoyaltyAdjustmentPayload(await request.json());
  } catch {
    return apiError("Invalid adjustment request.", 400);
  }

  const validationError = validateLoyaltyAdjustment(payload);
  if (validationError) return apiError(validationError, 422);

  try {
    const result = await adjustLoyaltyPoints({
      customerId: await customerId(context),
      ...payload,
    });
    return json(serializeResult(result), 201);
  } catch (error) {
    if (error?.status) return apiError(error.message, error.status);
    throw error;
  }
}
