import { requireAdminPage } from "../../../../lib/auth/admin";
import { hasRole } from "../../../../lib/auth/rbac";
import { getHomepageAdminOptions, getHomepageCms, HOMEPAGE_MANAGE_ROLES, HOMEPAGE_READ_ROLES } from "../../../../lib/homepage/cms";
import HomepageCmsClient from "./HomepageCmsClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminHomepagePage() {
  const session = await requireAdminPage();
  const user = {
    ...session.user,
    roles: session.user.roles.map((name) => ({ role: { name } })),
  };

  if (!hasRole(user, HOMEPAGE_READ_ROLES)) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ef3338]">Access denied</p>
        <h2 className="mt-2 text-2xl font-black text-[#111827]">Homepage CMS is not available for this role.</h2>
        <p className="mt-3 text-sm font-semibold text-[#667085]">Ask a SUPER_ADMIN or ADMIN to update homepage content.</p>
      </div>
    );
  }

  const [cms, options] = await Promise.all([getHomepageCms(), getHomepageAdminOptions()]);

  return <HomepageCmsClient initialCms={cms} options={options} canManage={hasRole(user, HOMEPAGE_MANAGE_ROLES)} />;
}
