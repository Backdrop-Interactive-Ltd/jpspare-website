import { apiError, json, prisma, requireAdminApi } from "../../../_utils";
import { CATALOG_READ_ROLES } from "../../../../../../lib/admin/catalogPayload";
import { extractEmailTemplateVariables, renderEmailTemplate } from "../../../../../../lib/email/render-template";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const id = async (context) => (await context.params).id;

function parseVariables(value) {
  if (!value) return {};
  const parsed = JSON.parse(value);
  if (!parsed || (typeof parsed !== "object" && !Array.isArray(parsed))) {
    throw new Error("Variables must be a JSON object or array.");
  }
  return parsed;
}

export async function GET(request, context) {
  const auth = await requireAdminApi(CATALOG_READ_ROLES);
  if (auth.response) return auth.response;

  let variables;
  try {
    const { searchParams } = new URL(request.url);
    variables = parseVariables(searchParams.get("variables"));
  } catch {
    return apiError("Variables must be valid JSON.", 400);
  }

  const template = await prisma.emailTemplate.findUnique({ where: { id: await id(context) } });
  if (!template) return apiError("Email template not found.", 404);

  const rendered = renderEmailTemplate(template, variables);

  return json({
    subject: rendered.subject,
    html: rendered.htmlBody,
    text: rendered.textBody,
    variablesDetected: extractEmailTemplateVariables(template),
  });
}
