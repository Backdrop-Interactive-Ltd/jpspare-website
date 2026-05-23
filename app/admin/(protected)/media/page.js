import MediaLibraryClient from "./MediaLibraryClient";
import { MEDIA_ACCESS_ROLES } from "../../../../lib/admin/mediaPayload";
import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  if (!hasRole(user, MEDIA_ACCESS_ROLES)) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Media Library</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view or manage media.</p>
      </div>
    );
  }

  return <MediaLibraryClient mode="library" />;
}
