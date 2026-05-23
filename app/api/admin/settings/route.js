import { apiError, json, parseDateFields, pick, prisma, requireAdminApi } from "../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const fields = ["key", "value", "group", "isPublic", "externalId", "source", "syncStatus", "lastSyncedAt"];

export async function GET() {
  const auth = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"]);
  if (auth.response) return auth.response;
  const items = await prisma.siteSetting.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
  return json({ items });
}

export async function POST(request) {
  const auth = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"]);
  if (auth.response) return auth.response;
  const data = parseDateFields(pick(await request.json(), fields));
  if (!data.key || data.value === undefined) return apiError("key and value are required.", 422);
  const item = await prisma.siteSetting.create({ data });
  return json({ item }, 201);
}
