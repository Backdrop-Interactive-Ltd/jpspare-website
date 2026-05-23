export const MEDIA_ACCESS_ROLES = ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER", "CONTENT_EDITOR"];
export const MEDIA_MANAGE_ROLES = ["SUPER_ADMIN", "ADMIN", "PRODUCT_MANAGER", "CONTENT_EDITOR"];
export const MEDIA_DELETE_ROLES = ["SUPER_ADMIN", "ADMIN"];

export const MEDIA_FOLDERS = ["products", "categories", "brands", "general"];
export const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/svg+xml", "svg"],
]);

export function normalizeFolder(value) {
  return MEDIA_FOLDERS.includes(value) ? value : "general";
}

export function serializeMedia(item) {
  if (!item) return null;
  return {
    ...item,
    fileName: item.fileName || item.filename || item.url?.split("/").pop() || "media",
    filename: item.filename || item.fileName || item.url?.split("/").pop() || "media",
    originalName: item.originalName || item.fileName || item.filename || "media",
    filePath: item.filePath || item.url,
    fileSize: item.fileSize ?? item.size ?? 0,
    size: item.size ?? item.fileSize ?? 0,
    createdAt: item.createdAt?.toISOString?.() ?? item.createdAt,
    updatedAt: item.updatedAt?.toISOString?.() ?? item.updatedAt,
    lastSyncedAt: item.lastSyncedAt?.toISOString?.() ?? item.lastSyncedAt,
  };
}

export function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}
