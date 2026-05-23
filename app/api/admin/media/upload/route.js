import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { ALLOWED_IMAGE_TYPES, MEDIA_MANAGE_ROLES, normalizeFolder, serializeMedia } from "../../../../../lib/admin/mediaPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function safeFilename(name, mimeType) {
  const ext = path.extname(name || "").toLowerCase();
  const resolvedExt = ext || `.${ALLOWED_IMAGE_TYPES.get(mimeType) || "jpg"}`;
  const base = path
    .basename(name || "upload", ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "upload"}-${Date.now()}${resolvedExt}`;
}

function readImageSize(buffer, mimeType) {
  if (mimeType === "image/png" && buffer.length > 24) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (mimeType === "image/webp" && buffer.toString("ascii", 0, 4) === "RIFF") {
    const variant = buffer.toString("ascii", 12, 16);
    if (variant === "VP8X" && buffer.length > 30) {
      return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
    }
  }

  if (mimeType === "image/svg+xml") {
    const svg = buffer.toString("utf8", 0, Math.min(buffer.length, 4096));
    const width = svg.match(/\bwidth=["']?([0-9.]+)/i)?.[1];
    const height = svg.match(/\bheight=["']?([0-9.]+)/i)?.[1];
    return { width: width ? Math.round(Number(width)) : null, height: height ? Math.round(Number(height)) : null };
  }

  if (mimeType === "image/jpeg" && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
  }

  return { width: null, height: null };
}

export async function POST(request) {
  const auth = await requireAdminApi(MEDIA_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const formData = await request.formData();
  const files = formData.getAll("files").filter((file) => file && typeof file.arrayBuffer === "function");
  const folder = normalizeFolder(formData.get("folder")?.toString());

  if (!files.length) return apiError("No files uploaded.", 422);

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });

  const items = [];

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) return apiError("Supported files: jpg, jpeg, png, webp, svg.", 422);
    if (file.size > MAX_FILE_SIZE) return apiError("Each file must be 10MB or smaller.", 422);

    const filename = safeFilename(file.name, file.type);
    const buffer = Buffer.from(await file.arrayBuffer());
    const dimensions = readImageSize(buffer, file.type);
    const filePath = path.join("uploads", folder, filename);
    const url = `/${filePath}`;
    await writeFile(path.join(uploadDir, filename), buffer);

    const item = await prisma.media.create({
      data: {
        url,
        type: "IMAGE",
        alt: formData.get("alt")?.toString() || null,
        fileName: filename,
        filename,
        originalName: file.name || filename,
        filePath,
        mimeType: file.type,
        fileSize: file.size,
        size: file.size,
        width: dimensions.width,
        height: dimensions.height,
        uploadedById: auth.session.user.id,
      },
    });

    items.push(serializeMedia(item));
  }

  return json({ items }, 201);
}
