"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

const menuItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "▦" },
  { label: "Products", href: "/admin/products", icon: "□" },
  { label: "Categories", href: "/admin/categories", icon: "▤" },
  { label: "Brands", href: "/admin/brands", icon: "◇" },
  { label: "Media Library", href: "/admin/media", icon: "▧" },
  { label: "Homepage CMS", href: "/admin/homepage", icon: "⌂" },
  { label: "Orders", href: "/admin/orders", icon: "◫" },
  { label: "Inventory", href: "/admin/inventory", icon: "▣" },
  { label: "API Settings", href: "/admin/api-settings", icon: "⌁" },
  { label: "Users", href: "/admin/users", icon: "♙", superOnly: true },
  { label: "Roles", href: "/admin/roles", icon: "◉", superOnly: true },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
];

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Sidebar({ roles, open, onClose }) {
  const pathname = usePathname();
  const isSuperAdmin = roles.includes("SUPER_ADMIN");
  const visibleMenu = menuItems.filter((item) => !item.superOnly || isSuperAdmin);

  return (
    <>
      <button
        type="button"
        aria-label="Close admin navigation"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-[#e5e7eb] bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-[#eef0f3] px-5">
          <div className="grid size-11 place-items-center rounded-2xl bg-[#ef3338] text-sm font-black text-white shadow-[0_12px_22px_rgba(239,51,56,0.24)]">JS</div>
          <div>
            <p className="text-lg font-black leading-none text-[#111827]">JPSPARE</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#98a2b3]">Admin CMS</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {visibleMenu.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex h-11 items-center gap-3 rounded-xl px-4 text-sm font-black transition ${
                  active
                    ? "bg-[#ef3338] text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)]"
                    : "text-[#344054] hover:bg-red-50 hover:text-[#ef3338]"
                }`}
              >
                <span className="grid size-6 place-items-center text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#eef0f3] p-4">
          <div className="rounded-2xl bg-[#f8fafc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#98a2b3]">Active Role</p>
            <p className="mt-2 text-sm font-black text-[#111827]">{roles[0] || "ADMIN"}</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function AdminShell({ session, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const roles = session.user.roles || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <div className="flex">
        <Sidebar roles={roles} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="grid size-10 place-items-center rounded-xl border border-[#d0d5dd] bg-white text-xl font-black text-[#344054] lg:hidden"
                  aria-label="Open admin navigation"
                >
                  ≡
                </button>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">JPSPARE CMS</p>
                  <h1 className="text-lg font-black leading-tight text-[#111827] sm:text-xl">Admin Workspace</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-2 text-right sm:block">
                  <p className="text-xs font-bold text-[#667085]">{session.user.email}</p>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#ef3338]">{roles.join(" / ")}</p>
                </div>
                <LogoutButton />
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1500px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
