import { notFound } from "next/navigation";
import { CATALOG_MANAGE_ROLES } from "../../../../../lib/admin/catalogPayload";
import { prisma } from "../../../../../lib/db";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import NotificationTemplateForm from "../NotificationTemplateForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeTemplate(template) {
  if (!template) return null;
  return {
    ...template,
    createdAt: template.createdAt?.toISOString?.() ?? template.createdAt,
    updatedAt: template.updatedAt?.toISOString?.() ?? template.updatedAt,
  };
}

function label(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value, fallback = "Not recorded") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusClass(status) {
  if (status === "SENT") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "FAILED") return "bg-red-50 text-[#ef3338] ring-red-100";
  if (status === "READ") return "bg-blue-50 text-blue-700 ring-blue-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function channelClass(channel) {
  if (channel === "EMAIL") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (channel === "SMS") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (channel === "PUSH") return "bg-purple-50 text-purple-700 ring-purple-200";
  return "bg-red-50 text-[#ef3338] ring-red-100";
}

function successRate(total, failures) {
  if (!total) return "0%";
  return `${Math.round(((total - failures) / total) * 100)}%`;
}

function TemplateAnalyticsPanel({ template, countsByStatus, latestLogs }) {
  const totalSends = Object.values(countsByStatus).reduce((sum, count) => sum + count, 0);
  const failureCount = countsByStatus.FAILED || 0;
  const sentCount = countsByStatus.SENT || 0;
  const readCount = countsByStatus.READ || 0;
  const pendingCount = countsByStatus.PENDING || 0;
  const lastSent = latestLogs.find((log) => log.sentAt)?.sentAt || null;

  return (
    <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Notification Analytics</p>
          <h3 className="mt-1 text-2xl font-black text-[#111827]">Template Activity</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">Read-only notification log activity for this template.</p>
        </div>
        <span className={`rounded-full px-4 py-2 text-xs font-black ring-1 ${channelClass(template.channel)}`}>{label(template.channel)}</span>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {[
          ["Total sends", totalSends],
          ["Sent", sentCount],
          ["Failed", failureCount],
          ["Pending", pendingCount],
          ["Read", readCount],
          ["Success rate", successRate(totalSends, failureCount)],
        ].map(([itemLabel, value]) => (
          <div key={itemLabel} className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">{itemLabel}</p>
            <p className="mt-2 text-lg font-black text-[#111827]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">Last sent date</p>
        <p className="mt-2 text-sm font-black text-[#111827]">{formatDateTime(lastSent, "Never")}</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-[#eef0f3]">
        <div className="border-b border-[#eef0f3] bg-[#f8fafc] px-5 py-4">
          <h4 className="text-lg font-black text-[#111827]">Latest 10 Notification Logs</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] w-full text-left">
            <thead className="bg-white text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Recipient</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Provider</th>
                <th className="px-5 py-4">Sent At</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {latestLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{log.recipient}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(log.status)}`}>{label(log.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{log.provider || "Not recorded"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDateTime(log.sentAt, "Not sent")}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDateTime(log.createdAt)}</td>
                  <td className="px-5 py-4">
                    <p className="max-w-xs truncate text-sm font-bold text-[#b42318]">{log.errorMessage || "None"}</p>
                  </td>
                </tr>
              ))}
              {!latestLogs.length ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center">
                    <p className="text-base font-black text-[#111827]">No notification logs yet</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Logs will appear after this template is used.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default async function EditNotificationTemplatePage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);
  const { id } = await params;
  const template = await prisma.notificationTemplate.findUnique({ where: { id } });

  if (!template) notFound();

  const [statusCounts, latestLogs] = await Promise.all([
    prisma.notificationLog.groupBy({
      by: ["status"],
      where: { templateId: template.id },
      _count: { _all: true },
    }),
    prisma.notificationLog.findMany({
      where: { templateId: template.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);
  const countsByStatus = Object.fromEntries(statusCounts.map((row) => [row.status, row._count._all]));

  return (
    <div className="space-y-6">
      <NotificationTemplateForm mode="edit" template={serializeTemplate(template)} canManage={canManage} />
      <TemplateAnalyticsPanel template={template} countsByStatus={countsByStatus} latestLogs={latestLogs} />
    </div>
  );
}
