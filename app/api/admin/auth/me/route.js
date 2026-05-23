import { apiError, json } from "../../_utils";
import { getAdminSession } from "../../../../../lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return apiError("Unauthorized", 401);
  }

  return json(session);
}
