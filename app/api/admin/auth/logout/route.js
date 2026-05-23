import { json } from "../../_utils";
import { clearAdminSession } from "../../../../../lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  await clearAdminSession();
  return json({ ok: true });
}
