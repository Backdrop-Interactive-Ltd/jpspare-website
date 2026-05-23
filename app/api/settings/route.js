import { prisma } from "../../../lib/db";
import { fallbackSettings } from "../../../lib/fallbackData";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { isPublic: true },
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    if (!settings.length) {
      return Response.json({ settings: fallbackSettings, fallback: true });
    }

    const mapped = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    return Response.json({ settings: mapped, fallback: false });
  } catch {
    return Response.json({ settings: fallbackSettings, fallback: true });
  }
}
