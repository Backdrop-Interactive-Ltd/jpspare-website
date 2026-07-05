import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { CATALOG_MANAGE_ROLES } from "../../../../../lib/admin/catalogPayload";
import { prisma } from "../../../../../lib/db";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import { extractEmailTemplateVariables, renderEmailTemplate } from "../../../../../lib/email/render-template";
import { sendRenderedEmailWithSmtpProvider } from "../../../../../lib/email/send-template-email";
import EmailTemplateForm from "../EmailTemplateForm";

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

function parseVariables(value) {
  if (!value) return {};
  const parsed = JSON.parse(value);
  if (!parsed || (typeof parsed !== "object" && !Array.isArray(parsed))) {
    throw new Error("Variables must be a JSON object or array.");
  }
  return parsed;
}

function variablesInputValue(template, value) {
  if (value) return value;
  if (!template.variablesJson) return "";
  return JSON.stringify(template.variablesJson, null, 2);
}

function testStatusMessage(status) {
  if (status === "sent") return { tone: "success", text: "Test email sent successfully." };
  if (status === "invalid-email") return { tone: "error", text: "Please provide a valid test email address." };
  if (status === "invalid-json") return { tone: "error", text: "Variables JSON must be valid." };
  if (status === "forbidden") return { tone: "error", text: "You do not have permission to send test email." };
  if (status === "smtp") return { tone: "error", text: "SMTP provider is missing or incomplete." };
  if (status === "failed") return { tone: "error", text: "Test email could not be sent." };
  return null;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function Notice({ status }) {
  const message = testStatusMessage(status);
  if (!message) return null;

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${message.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-[#b42318]"}`}>
      {message.text}
    </div>
  );
}

function label(value) {
  return String(value || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusClass(status) {
  if (status === "SENT") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "FAILED") return "bg-red-50 text-[#ef3338] ring-red-100";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function categoryClass(category) {
  if (category === "MARKETING" || category === "NEWSLETTER") return "bg-purple-50 text-purple-700 ring-purple-200";
  if (category === "AUTH") return "bg-blue-50 text-blue-700 ring-blue-200";
  if (category === "ORDER" || category === "SHIPPING") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (category === "SUPPORT") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-red-50 text-[#ef3338] ring-red-100";
}

function TemplateAnalyticsPanel({ template, countsByStatus, latestLogs, variablesDetected }) {
  const successCount = countsByStatus.SENT || 0;
  const failureCount = countsByStatus.FAILED || 0;
  const pendingCount = countsByStatus.PENDING || 0;
  const lastLog = latestLogs[0] || null;

  return (
    <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Delivery Analytics</p>
          <h3 className="mt-1 text-2xl font-black text-[#111827]">Template Performance</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">Read-only delivery activity for this template.</p>
        </div>
        <span className={`rounded-full px-4 py-2 text-xs font-black ring-1 ${categoryClass(template.category)}`}>{label(template.category)}</span>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Success count", successCount],
          ["Failure count", failureCount],
          ["Pending count", pendingCount],
          ["Last delivery", lastLog ? label(lastLog.status) : "None"],
        ].map(([itemLabel, value]) => (
          <div key={itemLabel} className="rounded-2xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">{itemLabel}</p>
            <p className="mt-2 text-lg font-black text-[#111827]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-[#eef0f3] bg-white p-4">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">Variables Detected</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {variablesDetected.length ? variablesDetected.map((variable) => (
            <span key={variable} className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-[#ef3338] ring-1 ring-red-100">{variable}</span>
          )) : <span className="text-sm font-bold text-[#667085]">No variables detected.</span>}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-[#eef0f3]">
        <div className="border-b border-[#eef0f3] bg-[#f8fafc] px-5 py-4">
          <h4 className="text-lg font-black text-[#111827]">Latest 10 Delivery Logs</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left">
            <thead className="bg-white text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
              <tr>
                <th className="px-5 py-4">Recipient</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Provider</th>
                <th className="px-5 py-4">Sent At</th>
                <th className="px-5 py-4">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f3]">
              {latestLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-5 py-4 text-sm font-black text-[#111827]">{log.recipientEmail}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(log.status)}`}>{label(log.status)}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{log.provider || "Not recorded"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#667085]">{formatDateTime(log.sentAt)}</td>
                  <td className="px-5 py-4">
                    <p className="max-w-xs truncate text-sm font-bold text-[#b42318]">{log.errorMessage || "None"}</p>
                  </td>
                </tr>
              ))}
              {!latestLogs.length ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <p className="text-base font-black text-[#111827]">No delivery logs yet</p>
                    <p className="mt-2 text-sm font-semibold text-[#667085]">Logs will appear after this template is sent.</p>
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

function PreviewPanel({ template, variablesRaw, previewError, rendered, variablesDetected, canManage, testStatus, action }) {
  return (
    <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">Preview & Test</p>
          <h3 className="mt-1 text-2xl font-black text-[#111827]">Rendered Email</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">Preview and send a single test email. This does not create logs or wire transactional hooks.</p>
        </div>
        <span className={`rounded-full px-4 py-2 text-xs font-black ring-1 ${categoryClass(template.category)}`}>{label(template.category)}</span>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <form className="rounded-3xl border border-[#eef0f3] bg-[#f8fafc] p-4">
            <label className="block">
              <span className="text-sm font-black text-[#344054]">Preview Variables JSON</span>
              <textarea name="variables" defaultValue={variablesRaw} className="mt-2 h-56 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 py-3 font-mono text-xs font-semibold leading-6 text-[#111827] outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100" />
            </label>
            <button className="mt-4 h-11 rounded-xl bg-[#111827] px-5 text-sm font-black text-white">Refresh Preview</button>
            {previewError ? <p className="mt-3 text-sm font-bold text-[#b42318]">Variables JSON could not be parsed. Showing empty variables.</p> : null}
          </form>

          <form action={action} className="rounded-3xl border border-[#eef0f3] bg-white p-4">
            <h4 className="text-lg font-black text-[#111827]">Send Test Email</h4>
            <p className="mt-1 text-sm font-semibold text-[#667085]">Uses the active SMTP Email OTP provider configuration.</p>
            <Notice status={testStatus} />
            <label className="mt-4 block">
              <span className="text-sm font-black text-[#344054]">Test Email</span>
              <input name="email" type="email" disabled={!canManage} className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-[#f2f4f7]" placeholder="test@example.com" />
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-black text-[#344054]">Variables JSON</span>
              <textarea name="variables" defaultValue={variablesRaw} disabled={!canManage} className="mt-2 h-40 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 py-3 font-mono text-xs font-semibold leading-6 text-[#111827] outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-[#f2f4f7]" />
            </label>
            {canManage ? (
              <button className="mt-4 h-11 rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)]">Send Test</button>
            ) : (
              <p className="mt-4 text-sm font-bold text-[#ef3338]">Read-only role cannot send test emails.</p>
            )}
          </form>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-[#eef0f3] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">Detected Variables</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {variablesDetected.length ? variablesDetected.map((variable) => (
                <span key={variable} className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-[#ef3338] ring-1 ring-red-100">{variable}</span>
              )) : <span className="text-sm font-bold text-[#667085]">No variables detected.</span>}
            </div>
          </div>

          <div className="rounded-3xl border border-[#eef0f3] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">Subject</p>
            <p className="mt-2 text-base font-black text-[#111827]">{rendered.subject || "No subject"}</p>
          </div>

          <div className="rounded-3xl border border-[#eef0f3] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">HTML Preview</p>
            <iframe title="Email HTML preview" srcDoc={rendered.htmlBody || ""} className="mt-3 h-80 w-full rounded-2xl border border-[#d0d5dd] bg-white" />
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-black text-[#ef3338]">View rendered HTML</summary>
              <pre className="mt-3 max-h-72 overflow-auto rounded-2xl bg-[#111827] p-4 text-xs font-semibold leading-5 text-white">{rendered.htmlBody || ""}</pre>
            </details>
          </div>

          <div className="rounded-3xl border border-[#eef0f3] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">Text Body</p>
            <pre className="mt-3 max-h-56 overflow-auto rounded-2xl bg-[#f8fafc] p-4 text-sm font-semibold leading-6 text-[#344054]">{rendered.textBody || "No text body configured."}</pre>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function EditEmailTemplatePage({ params, searchParams }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const template = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!template) notFound();

  const variablesRaw = variablesInputValue(template, resolvedSearchParams?.variables);
  let variables = {};
  let previewError = false;

  try {
    variables = parseVariables(variablesRaw);
  } catch {
    previewError = true;
  }

  const rendered = renderEmailTemplate(template, previewError ? {} : variables);
  const variablesDetected = extractEmailTemplateVariables(template);
  const [statusCounts, latestLogs] = await Promise.all([
    prisma.emailDeliveryLog.groupBy({
      by: ["status"],
      where: { templateId: template.id },
      _count: { _all: true },
    }),
    prisma.emailDeliveryLog.findMany({
      where: { templateId: template.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);
  const countsByStatus = Object.fromEntries(statusCounts.map((row) => [row.status, row._count._all]));

  async function sendTestEmail(formData) {
    "use server";

    const actionSession = await requireAdminPage();
    const actionUser = { roles: actionSession.user.roles.map((name) => ({ role: { name } })) };

    if (!hasRole(actionUser, CATALOG_MANAGE_ROLES)) {
      redirect(`/admin/email-templates/${id}?test=forbidden`);
    }

    const email = String(formData.get("email") || "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      redirect(`/admin/email-templates/${id}?test=invalid-email`);
    }

    let actionVariables = {};
    try {
      actionVariables = parseVariables(String(formData.get("variables") || ""));
    } catch {
      redirect(`/admin/email-templates/${id}?test=invalid-json`);
    }

    const actionTemplate = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!actionTemplate) notFound();
    const actionRendered = renderEmailTemplate(actionTemplate, actionVariables);

    try {
      await sendRenderedEmailWithSmtpProvider({
        to: email,
        subject: actionRendered.subject,
        html: actionRendered.htmlBody,
        text: actionRendered.textBody,
      });
    } catch (error) {
      if (
        error?.code === "SMTP_PROVIDER_NOT_CONFIGURED" ||
        error?.code === "SMTP_PROVIDER_INACTIVE" ||
        error?.code === "SMTP_PROVIDER_INVALID" ||
        error?.code === "SMTP_PROVIDER_UNSUPPORTED"
      ) {
        redirect(`/admin/email-templates/${id}?test=smtp`);
      }
      redirect(`/admin/email-templates/${id}?test=failed`);
    }

    redirect(`/admin/email-templates/${id}?test=sent`);
  }

  return (
    <div className="space-y-6">
      <EmailTemplateForm mode="edit" template={serializeTemplate(template)} canManage={canManage} />
      <TemplateAnalyticsPanel template={template} countsByStatus={countsByStatus} latestLogs={latestLogs} variablesDetected={variablesDetected} />
      <PreviewPanel
        template={template}
        variablesRaw={variablesRaw}
        previewError={previewError}
        rendered={rendered}
        variablesDetected={variablesDetected}
        canManage={canManage}
        testStatus={resolvedSearchParams?.test}
        action={sendTestEmail}
      />
    </div>
  );
}
