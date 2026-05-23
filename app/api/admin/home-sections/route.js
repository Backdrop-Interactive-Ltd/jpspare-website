import { apiError, json, parseDateFields, pick, prisma, requireAdminApi } from "../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const fields = ["key", "title", "type", "content", "sortOrder", "isActive", "externalId", "source", "syncStatus", "lastSyncedAt"];

export async function GET() {
  const auth = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"]);
  if (auth.response) return auth.response;
  const items = await prisma.homeSection.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
  return json({ items });
}

export async function POST(request) {
  const auth = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"]);
  if (auth.response) return auth.response;
  const data = parseDateFields(pick(await request.json(), fields));
  if (!data.key || !data.title || !data.type || data.content === undefined) return apiError("key, title, type, and content are required.", 422);
  const item = await prisma.homeSection.create({ data });
  return json({ item }, 201);
}
