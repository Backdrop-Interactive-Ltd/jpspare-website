import { apiError, json, parseDateFields, pick, prisma, requireAdminApi } from "../_utils";
import { MEDIA_ACCESS_ROLES, MEDIA_MANAGE_ROLES, serializeMedia } from "../../../../lib/admin/mediaPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const fields = ["url", "type", "alt", "fileName", "filename", "originalName", "filePath", "mimeType", "fileSize", "size", "width", "height", "externalId", "source", "syncStatus", "lastSyncedAt"];

export async function GET(request) {
  const auth = await requireAdminApi(MEDIA_ACCESS_ROLES);
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 60), 1), 120);
  const where = q
    ? {
        OR: [
          { fileName: { contains: q, mode: "insensitive" } },
          { filename: { contains: q, mode: "insensitive" } },
          { originalName: { contains: q, mode: "insensitive" } },
          { alt: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [items, total] = await prisma.$transaction([
    prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.media.count({ where }),
  ]);

  return json({ items: items.map(serializeMedia), total, page, totalPages: Math.max(Math.ceil(total / limit), 1) });
}

export async function POST(request) {
  const auth = await requireAdminApi(MEDIA_MANAGE_ROLES);
  if (auth.response) return auth.response;
  const data = parseDateFields(pick(await request.json(), fields));
  if (!data.url) return apiError("url is required.", 422);
  const fileName = data.fileName || data.filename || data.url.split("/").pop();
  const item = await prisma.media.create({
    data: {
      ...data,
      fileName,
      filename: data.filename || fileName,
      originalName: data.originalName || fileName,
      filePath: data.filePath || data.url,
      fileSize: data.fileSize ?? data.size,
      size: data.size ?? data.fileSize,
      uploadedById: auth.session.user.id,
    },
  });
  return json({ item: serializeMedia(item) }, 201);
}
