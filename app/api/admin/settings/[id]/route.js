import { apiError, json, parseDateFields, pick, prisma, requireAdminApi } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const fields = ["key", "value", "group", "isPublic", "externalId", "source", "syncStatus", "lastSyncedAt"];
const id = async (context) => (await context.params).id;

export async function GET(_request, context) {
  const auth = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"]);
  if (auth.response) return auth.response;
  const item = await prisma.siteSetting.findUnique({ where: { id: await id(context) } });
  if (!item) return apiError("Setting not found.", 404);
  return json({ item });
}

export async function PATCH(request, context) {
  const auth = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"]);
  if (auth.response) return auth.response;
  const item = await prisma.siteSetting.update({ where: { id: await id(context) }, data: parseDateFields(pick(await request.json(), fields)) });
  return json({ item });
}

export async function DELETE(_request, context) {
  const auth = await requireAdminApi(["SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR"]);
  if (auth.response) return auth.response;
  await prisma.siteSetting.delete({ where: { id: await id(context) } });
  return json({ ok: true });
}
