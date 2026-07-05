import { apiError, json, prisma, requireAdminApi } from "../../../_utils";
import { CATALOG_MANAGE_ROLES } from "../../../../../../lib/admin/catalogPayload";
import { renderEmailTemplate } from "../../../../../../lib/email/render-template";
import { sendRenderedEmailWithSmtpProvider } from "../../../../../../lib/email/send-template-email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const id = async (context) => (await context.params).id;

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function parseVariables(value) {
  if (value === undefined || value === null || value === "") return {};
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || (typeof parsed !== "object" && !Array.isArray(parsed))) {
    throw new Error("Variables must be a JSON object or array.");
  }
  return parsed;
}

function smtpErrorResponse(error) {
  if (error?.code === "SMTP_PROVIDER_NOT_CONFIGURED") return apiError("No active SMTP provider is configured.", 422);
  if (error?.code === "SMTP_PROVIDER_INACTIVE") return apiError("SMTP provider is inactive.", 422);
  if (error?.code === "SMTP_PROVIDER_INVALID") return apiError("SMTP provider configuration is incomplete.", 422);
  if (error?.code === "SMTP_PROVIDER_UNSUPPORTED") return apiError("Configured provider is not an SMTP email provider.", 422);
  return apiError("Test email could not be sent.", 502);
}

export async function POST(request, context) {
  const auth = await requireAdminApi(CATALOG_MANAGE_ROLES);
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return apiError("Please provide a valid test email address.", 400);
  }

  let variables;
  try {
    variables = parseVariables(body.variables);
  } catch {
    return apiError("Variables must be valid JSON.", 400);
  }

  const template = await prisma.emailTemplate.findUnique({ where: { id: await id(context) } });
  if (!template) return apiError("Email template not found.", 404);

  const rendered = renderEmailTemplate(template, variables);

  try {
    await sendRenderedEmailWithSmtpProvider({
      to: email,
      subject: rendered.subject,
      html: rendered.htmlBody,
      text: rendered.textBody,
    });
  } catch (error) {
    return smtpErrorResponse(error);
  }

  return json({ success: true });
}
