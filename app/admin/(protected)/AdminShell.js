"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

const dashboardItem = { label: "Dashboard", href: "/admin/dashboard", icon: "⌂" };

const menuGroups = [
  {
    key: "website",
    label: "Website",
    icon: "▦",
    children: [
      {
        key: "homepage",
        label: "Homepage",
        icon: "⌂",
        items: [{ label: "Homepage CMS", href: "/admin/homepage" }],
      },
      {
        key: "content",
        label: "Content",
        icon: "▧",
        items: [
          { label: "Blog Posts", href: "/admin/blog-posts" },
          { label: "Add Blog Post", href: "/admin/blog-posts/new" },
          { label: "Blog Categories", href: "/admin/blog-categories" },
          { label: "Add Blog Category", href: "/admin/blog-categories/new" },
        ],
      },
      {
        key: "media",
        label: "Media Library",
        icon: "▩",
        items: [
          { label: "Media Library", href: "/admin/media" },
          { label: "Upload Media", href: "/admin/media/upload" },
        ],
      },
    ],
  },
  {
    key: "product",
    label: "Product",
    icon: "□",
    items: [
      { label: "Add Product", href: "/admin/products/new" },
      { label: "Bulk Import", href: "/admin/products?tool=bulk-import" },
      { label: "Bulk Export", href: "/admin/products?tool=bulk-export" },
      { label: "All Products", href: "/admin/products" },
      { label: "Low Stock Products", href: "/admin/products?filter=low-stock" },
      { label: "Out of Stock Products", href: "/admin/products?filter=out-of-stock" },
      { label: "Top Selling Products", href: "/admin/products?sort=top-selling" },
      { label: "Trashed Products", href: "/admin/products?status=ARCHIVED" },
      { label: "Reviews", href: "/admin/products?view=reviews" },
      { label: "Media Files", href: "/admin/media" },
    ],
  },
  {
    key: "product-configuration",
    label: "Product Configuration",
    icon: "▨",
    items: [
      { label: "Attributes", href: "/admin/attributes" },
      { label: "Brands", href: "/admin/brands" },
      { label: "Categories", href: "/admin/categories" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: "◈",
    children: [
      {
        key: "campaigns",
        label: "Campaigns",
        icon: "◈",
        items: [
          { label: "All Campaigns", href: "/admin/campaigns" },
          { label: "Add Campaign", href: "/admin/campaigns/new" },
        ],
      },
      {
        key: "promotions",
        label: "Promotions",
        icon: "%",
        items: [
          { label: "Coupons", href: "/admin/coupons" },
          { label: "Add Coupon", href: "/admin/coupons/new" },
        ],
      },
      {
        key: "communications",
        label: "Communications",
        icon: "✉",
        items: [
          { label: "Email Templates", href: "/admin/email-templates" },
          { label: "Add Email Template", href: "/admin/email-templates/new" },
          { label: "Email Logs", href: "/admin/email-delivery-logs" },
          { label: "Notification Templates", href: "/admin/notification-templates" },
          { label: "Add Notification Template", href: "/admin/notification-templates/new" },
          { label: "Notification Logs", href: "/admin/notification-logs" },
        ],
      },
    ],
  },
  {
    key: "orders",
    label: "Orders",
    icon: "▣",
    items: [
      { label: "All Orders", href: "/admin/orders" },
      { label: "Pending Orders", href: "/admin/orders?status=PENDING" },
      { label: "Processing Orders", href: "/admin/orders?status=PROCESSING" },
      { label: "Dispatched Orders", href: "/admin/orders?status=SHIPPED" },
      { label: "Delivered Orders", href: "/admin/orders?status=DELIVERED" },
      { label: "Cancelled Orders", href: "/admin/orders?status=CANCELLED" },
      { label: "Return Orders", href: "/admin/returns" },
      { label: "COD Orders", href: "/admin/orders?paymentStatus=UNPAID" },
    ],
  },
  {
    key: "commerce",
    label: "Commerce",
    icon: "◫",
    children: [
      {
        key: "customers",
        label: "Customers",
        icon: "♙",
        items: [
          { label: "Customer Segments", href: "/admin/customer-segments" },
          { label: "Add Customer Segment", href: "/admin/customer-segments/new" },
          { label: "Loyalty Wallets", href: "/admin/loyalty" },
          { label: "Referrals", href: "/admin/referrals" },
        ],
      },
    ],
  },
  {
    key: "administration",
    label: "Administration",
    icon: "⚙",
    children: [
      {
        key: "settings",
        label: "Settings",
        icon: "⚙",
        items: [
          { label: "General Settings", href: "/admin/settings" },
          { label: "API Settings", href: "/admin/api-settings" },
          { label: "Auth / OTP", href: "/admin/otp-settings" },
        ],
      },
      {
        key: "access",
        label: "Access Control",
        icon: "♙",
        items: [
          { label: "Users", href: "/admin/users", superOnly: true },
          { label: "Roles", href: "/admin/roles", superOnly: true },
        ],
      },
    ],
  },
  {
    key: "integrations",
    label: "Integrations",
    icon: "⌁",
    children: [
      {
        key: "events",
        label: "Integration Monitor",
        icon: "⌁",
        items: [{ label: "Integration Events", href: "/admin/integrations" }],
      },
    ],
  },
  {
    key: "legacy",
    label: "Legacy / BMS Transition",
    icon: "▣",
    superOnly: true,
    muted: true,
    children: [
      {
        key: "inventory",
        label: "Inventory & Warehouse",
        icon: "▦",
        items: [
          { label: "Inventory", href: "/admin/inventory" },
          { label: "Inventory Intelligence", href: "/admin/inventory-intelligence" },
          { label: "Warehouses", href: "/admin/warehouses" },
          { label: "Warehouse Stock", href: "/admin/warehouse-stock" },
          { label: "Stock Transfers", href: "/admin/stock-transfers" },
        ],
      },
      {
        key: "operations",
        label: "Operations",
        icon: "▤",
        items: [
          { label: "Suppliers", href: "/admin/suppliers" },
          { label: "Purchases", href: "/admin/purchases" },
          { label: "Fulfillment", href: "/admin/fulfillment" },
          { label: "Finance", href: "/admin/finance" },
        ],
      },
      {
        key: "ai",
        label: "AI Operations",
        icon: "✦",
        items: [
          { label: "AI Dashboard", href: "/admin/ai" },
          { label: "AI Agents", href: "/admin/ai/agents" },
          { label: "AI Tasks", href: "/admin/ai/tasks" },
          { label: "AI Approvals", href: "/admin/ai/approvals" },
          { label: "AI Logs", href: "/admin/ai/logs" },
        ],
      },
    ],
  },
];

function hrefParts(href) {
  const [pathWithHash, queryString = ""] = href.split("?");
  const [path] = pathWithHash.split("#");
  return { path, queryString };
}

function queryMatches(currentSearch, queryString) {
  if (!queryString) return !currentSearch;

  const expected = new URLSearchParams(queryString);
  const current = new URLSearchParams(currentSearch);

  for (const [key, value] of expected.entries()) {
    if (current.get(key) !== value) return false;
  }

  return true;
}

function matchesHref(pathname, currentSearch, href) {
  const { path, queryString } = hrefParts(href);
  if (pathname !== path && !pathname.startsWith(`${path}/`)) return false;
  if (queryString) return pathname === path && queryMatches(currentSearch, queryString);
  if (pathname === path) return queryMatches(currentSearch, queryString);
  return true;
}

function hrefSpecificity(href) {
  const { path, queryString } = hrefParts(href);
  return path.length + (queryString ? queryString.length + 1000 : 0);
}

function itemIsActive(pathname, currentSearch, item, siblings = []) {
  if (!matchesHref(pathname, currentSearch, item.href)) return false;
  const specificity = hrefSpecificity(item.href);
  return !siblings.some((sibling) => sibling.href !== item.href && matchesHref(pathname, currentSearch, sibling.href) && hrefSpecificity(sibling.href) > specificity);
}

function childIsActive(pathname, currentSearch, child) {
  return child.items.some((item) => itemIsActive(pathname, currentSearch, item, child.items));
}

function groupIsActive(pathname, currentSearch, group) {
  if (group.items?.length) return group.items.some((item) => itemIsActive(pathname, currentSearch, item, group.items));
  return group.children.some((child) => childIsActive(pathname, currentSearch, child));
}

function filterItemsByRole(items, isSuperAdmin) {
  return items.filter((item) => !item.superOnly || isSuperAdmin);
}

function filterMenuByRole(isSuperAdmin) {
  return menuGroups
    .filter((group) => !group.superOnly || isSuperAdmin)
    .map((group) => ({
      ...group,
      items: group.items ? filterItemsByRole(group.items, isSuperAdmin) : undefined,
      children: group.children
        ? group.children
            .map((child) => ({ ...child, items: filterItemsByRole(child.items, isSuperAdmin) }))
            .filter((child) => child.items.length)
        : undefined,
    }))
    .filter((group) => group.items?.length || group.children?.length);
}

function Sidebar({ roles, open, onClose }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();
  const isSuperAdmin = roles.includes("SUPER_ADMIN");
  const visibleGroups = filterMenuByRole(isSuperAdmin);
  const activeGroup = visibleGroups.find((group) => groupIsActive(pathname, currentSearch, group));
  const [openGroupKeys, setOpenGroupKeys] = useState(() => (activeGroup?.key ? { [activeGroup.key]: true } : { website: true }));
  const [closedChildren, setClosedChildren] = useState({});

  function isGroupOpen(group) {
    return Boolean(openGroupKeys[group.key]);
  }

  function toggleGroup(group) {
    setOpenGroupKeys((current) => ({ ...current, [group.key]: !current[group.key] }));
  }

  function isChildOpen(group, child) {
    if (childIsActive(pathname, currentSearch, child)) return true;
    const key = `${group.key}:${child.key}`;
    return closedChildren[key] !== true;
  }

  function toggleChild(group, child) {
    const key = `${group.key}:${child.key}`;
    setClosedChildren((current) => ({ ...current, [key]: !current[key] }));
  }

  function renderLeafLink(item, siblings) {
    const active = itemIsActive(pathname, currentSearch, item, siblings);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={`group/link flex min-h-8 items-center gap-3 rounded-lg py-1.5 pl-10 pr-3 text-sm font-semibold transition ${
          active
            ? "bg-white/10 text-white shadow-[inset_3px_0_0_#ff4b22]"
            : "text-[#b7c0ca] hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        <span className={`size-1.5 rounded-full ring-1 ring-current ${active ? "bg-[#ff4b22] text-[#ff4b22]" : "bg-transparent text-[#7c8793]"}`} />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      </Link>
    );
  }

  function renderChild(group, child) {
    const childActive = childIsActive(pathname, currentSearch, child);
    const childOpen = isChildOpen(group, child);

    return (
      <div key={child.key} className="space-y-1">
        <button
          type="button"
          onClick={() => toggleChild(group, child)}
          className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-black transition ${
            childActive ? "text-white" : "text-[#d7dde4] hover:bg-white/[0.06] hover:text-white"
          }`}
          aria-expanded={childOpen}
        >
          <span className={`grid size-5 shrink-0 place-items-center text-[13px] ${childActive ? "text-[#ff4b22]" : "text-[#d7dde4]"}`}>{child.icon}</span>
          <span className="min-w-0 flex-1 truncate">{child.label}</span>
          <span aria-hidden="true" className={`text-xs text-[#a7b0bb] transition-transform ${childOpen ? "rotate-180" : ""}`}>⌄</span>
        </button>
        {childOpen ? <div className="space-y-0.5">{child.items.map((item) => renderLeafLink(item, child.items))}</div> : null}
      </div>
    );
  }

  function renderGroup(group) {
    const groupActive = groupIsActive(pathname, currentSearch, group);
    const groupOpen = isGroupOpen(group);
    const muted = group.muted && !groupActive;

    return (
      <section key={group.key} className={`border-t border-white/[0.08] py-3 first:border-t-0 ${group.key === "legacy" ? "mt-auto" : ""}`}>
        <button
          type="button"
          onClick={() => toggleGroup(group)}
          className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left transition ${
            groupActive
              ? "bg-[#f0441f] text-white shadow-[0_12px_24px_rgba(240,68,31,0.25)]"
              : muted
                ? "text-[#6f7883] hover:bg-white/[0.04] hover:text-[#a7b0bb]"
                : "text-[#e5e9ee] hover:bg-white/[0.06] hover:text-white"
          }`}
          aria-expanded={groupOpen}
        >
          <span className={`grid size-7 shrink-0 place-items-center text-base ${groupActive ? "text-white" : muted ? "text-[#6f7883]" : "text-[#d7dde4]"}`}>{group.icon}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-black">{group.label}</span>
          <span aria-hidden="true" className={`text-sm transition-transform ${groupOpen ? "rotate-180" : ""}`}>⌄</span>
        </button>
        {groupOpen ? (
          <div className="mt-2 space-y-2">
            {group.items ? <div className="space-y-0.5">{group.items.map((item) => renderLeafLink(item, group.items))}</div> : null}
            {group.children ? group.children.map((child) => renderChild(group, child)) : null}
          </div>
        ) : null}
      </section>
    );
  }

  const dashboardActive = itemIsActive(pathname, currentSearch, dashboardItem);

  return (
    <>
      <button
        type="button"
        aria-label="Close admin navigation"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 transition lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[304px] flex-col overflow-hidden border-r border-white/[0.08] bg-[#0f1419] text-white shadow-2xl shadow-black/30 transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,92,38,0.16),transparent_34%),linear-gradient(160deg,rgba(255,255,255,0.06),transparent_42%)]" />
        <div className="relative flex h-20 items-center gap-3 border-b border-white/[0.08] px-5">
          <div className="grid size-11 place-items-center rounded-xl bg-white text-lg font-black italic text-[#f0441f]">JP</div>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-black leading-none tracking-tight">
              <span className="text-white">JP</span><span className="text-[#f0441f]">SPARE</span>
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#7f8a96]">Website CMS</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-lg text-2xl text-white/80 transition hover:bg-white/[0.08] hover:text-white lg:hidden"
            aria-label="Close admin navigation"
          >
            ×
          </button>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-2.5 py-4">
          <Link
            href={dashboardItem.href}
            onClick={onClose}
            className={`mb-3 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-black transition ${
              dashboardActive
                ? "bg-[#f0441f] text-white shadow-[0_12px_24px_rgba(240,68,31,0.25)]"
                : "text-[#e5e9ee] hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <span className="grid size-7 place-items-center text-base">{dashboardItem.icon}</span>
            <span className="min-w-0 flex-1 truncate">{dashboardItem.label}</span>
          </Link>

          <div className="space-y-0">{visibleGroups.map((group) => renderGroup(group))}</div>
        </nav>

        <div className="relative border-t border-white/[0.08] p-4">
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7f8a96]">Active Role</p>
            <p className="mt-1 truncate text-sm font-black text-white">{roles[0] || "ADMIN"}</p>
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
