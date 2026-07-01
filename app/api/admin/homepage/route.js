import { revalidatePath } from "next/cache";
import { apiError, json, requireAdminApi } from "../_utils";
import { getHomepageAdminOptions, getHomepageCms, HOMEPAGE_MANAGE_ROLES, HOMEPAGE_READ_ROLES, saveHomepageCms } from "../../../../lib/homepage/cms";
import { hasRole } from "../../../../lib/auth/rbac";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi(HOMEPAGE_READ_ROLES);
  if (auth.response) return auth.response;

  const [cms, options] = await Promise.all([getHomepageCms(), getHomepageAdminOptions()]);
  const user = {
    ...auth.session.user,
    roles: auth.session.user.roles.map((name) => ({ role: { name } })),
  };

  return json({
    cms,
    options,
    canManage: hasRole(user, HOMEPAGE_MANAGE_ROLES),
  });
}

export async function PUT(request) {
  const auth = await requireAdminApi(HOMEPAGE_MANAGE_ROLES);
  if (auth.response) return auth.response;

  try {
    const payload = await request.json();
    const cms = await saveHomepageCms(payload);
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return json({ cms });
  } catch (error) {
    console.error("Homepage CMS save failed", {
      message: error?.message,
      code: error?.code,
    });
    return apiError(error.message || "Unable to save homepage CMS", 400);
  }
}
