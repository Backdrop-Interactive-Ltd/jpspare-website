import { apiError, json, parseDateFields, pick, prisma, requireAdminApi } from "../../_utils";
import { MEDIA_ACCESS_ROLES, MEDIA_DELETE_ROLES, MEDIA_MANAGE_ROLES, serializeMedia } from "../../../../../lib/admin/mediaPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const fields = ["url", "type", "alt", "fileName", "filename", "originalName", "filePath", "mimeType", "fileSize", "size", "width", "height", "externalId", "source", "syncStatus", "lastSyncedAt"];
const id = async (context) => (await context.params).id;

export async function GET(_request, context) {
  const auth = await requireAdminApi(MEDIA_ACCESS_ROLES);
  if (auth.response) return auth.response;
  const item = await prisma.media.findUnique({ where: { id: await id(context) } });
  if (!item) return apiError("Media not found.", 404);
  return json({ item: serializeMedia(item) });
}

export async function PATCH(request, context) {
  const auth = await requireAdminApi(MEDIA_MANAGE_ROLES);
  if (auth.response) return auth.response;
  const item = await prisma.media.update({ where: { id: await id(context) }, data: parseDateFields(pick(await request.json(), fields)) });
  return json({ item: serializeMedia(item) });
}

export async function DELETE(_request, context) {
  const auth = await requireAdminApi(MEDIA_DELETE_ROLES);
  if (auth.response) return auth.response;
  await prisma.media.delete({ where: { id: await id(context) } });
  return json({ ok: true });
}
