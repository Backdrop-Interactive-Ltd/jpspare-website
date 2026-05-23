import { requireAdminPage } from "../../../../lib/auth/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const dashboardCards = [
  { label: "Products API", value: "/api/admin/products", tone: "bg-red-50 text-[#ef3338]" },
  { label: "Categories API", value: "/api/admin/categories", tone: "bg-blue-50 text-blue-600" },
  { label: "Brands API", value: "/api/admin/brands", tone: "bg-emerald-50 text-emerald-600" },
  { label: "Settings API", value: "/api/admin/settings", tone: "bg-yellow-50 text-yellow-700" },
];

export default async function AdminDashboardPage() {
  const session = await requireAdminPage();

  return (
    <div>
      <div className="flex flex-col gap-5 rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ef3338]">Admin CMS Foundation</p>
          <h2 className="mt-2 text-4xl font-black tracking-[-0.04em]">Welcome, {session.user.name || session.user.email}</h2>
          <p className="mt-2 text-sm text-[#667085]">Roles: {session.user.roles.join(", ")}</p>
        </div>
        <div className="rounded-2xl bg-[#fff1f1] px-5 py-3 text-sm font-black text-[#ef3338]">Phase 2.1</div>
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className={`mb-6 grid size-12 place-items-center rounded-xl ${card.tone}`}>API</div>
            <h3 className="text-lg font-black">{card.label}</h3>
            <p className="mt-3 rounded-xl bg-[#f3f4f6] px-3 py-2 font-mono text-xs text-[#4b5563]">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-[#f7d95f] bg-[#fffafa] p-6">
        <h3 className="text-2xl font-black">API-first foundation ready</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#4b5563]">
          This dashboard is intentionally a shell for now. The secure session, RBAC structure, Prisma models, seed admin, and CRUD route foundations are in place for future ERP/BMS sync.
        </p>
      </section>
    </div>
  );
}
