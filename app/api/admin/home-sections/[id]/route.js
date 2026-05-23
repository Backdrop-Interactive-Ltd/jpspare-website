import { apiError, json, parseDateFields, pick, prisma, requireAdminApi } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const fields = ["key", "title", "type", "content", "sortOrder", "isActive", "externalId", "source", "syncStatus", "lastSyncedAt"];
const id = async (context) => (await context.params).id;

export async function GET(_request, context) {
  const auth = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"]);
  if (auth.response) return auth.response;
  const item = await prisma.homeSection.findUnique({ where: { id: await id(context) } });
  if (!item) return apiError("Home section not found.", 404);
  return json({ item });
}

export async function PATCH(request, context) {
  const auth = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"]);
  if (auth.response) return auth.response;
  const item = await prisma.homeSection.update({ where: { id: await id(context) }, data: parseDateFields(pick(await request.json(), fields)) });
  return json({ item });
}

export async function DELETE(_request, context) {
  const auth = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"]);
  if (auth.response) return auth.response;
  await prisma.homeSection.delete({ where: { id: await id(context) } });
  return json({ ok: true });
}
