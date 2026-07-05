import { prisma } from "../db.js";
import { renderEmailTemplate } from "./render-template.js";
import { sendRenderedEmailWithSmtpProvider } from "./send-template-email.js";

const WELCOME_TEMPLATE_SLUG = "welcome-email";
const PASSWORD_RESET_TEMPLATE_SLUG = "password-reset";

function customerName(customer) {
  return [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim() || customer?.name || "Customer";
}

function baseUrlFromRequest(request) {
  const origin = request?.headers?.get?.("origin");
  if (origin) return origin;
  const host = request?.headers?.get?.("host");
  return host ? `http://${host}` : "";
}

function safeErrorMessage(error, fallback) {
  return error?.code || error?.message || fallback;
}

async function sendLifecycleEmail({ templateSlug, customer, recipientEmail, variables, fallbackErrorCode }) {
  try {
    const email = String(recipientEmail || customer?.email || "").trim().toLowerCase();

    if (!email) {
      return { skipped: true, reason: "MISSING_RECIPIENT_EMAIL" };
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { slug: templateSlug },
    });

    if (!template || !template.isActive) {
      return { skipped: true, reason: "TEMPLATE_MISSING_OR_INACTIVE" };
    }

    const rendered = renderEmailTemplate(template, variables);
    const log = await prisma.emailDeliveryLog.create({
      data: {
        template: { connect: { id: template.id } },
        recipientEmail: email,
        subject: rendered.subject,
        status: "PENDING",
      },
    });

    try {
      const result = await sendRenderedEmailWithSmtpProvider({
        to: email,
        subject: rendered.subject,
        html: rendered.htmlBody,
        text: rendered.textBody,
      });

      await prisma.emailDeliveryLog.update({
        where: { id: log.id },
        data: {
          status: "SENT",
          provider: result.providerName,
          providerMessageId: result.messageId,
          sentAt: new Date(),
        },
      });

      return { sent: true, logId: log.id };
    } catch (error) {
      await prisma.emailDeliveryLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          errorMessage: safeErrorMessage(error, fallbackErrorCode),
        },
      });

      return { sent: false, logId: log.id, error: safeErrorMessage(error, fallbackErrorCode) };
    }
  } catch (error) {
    return { skipped: true, reason: safeErrorMessage(error, fallbackErrorCode) };
  }
}

export async function sendWelcomeEmail(customer) {
  return sendLifecycleEmail({
    templateSlug: WELCOME_TEMPLATE_SLUG,
    customer,
    variables: {
      brandName: "JPSPARE",
      customerName: customerName(customer),
      customerEmail: customer?.email || "",
      customerPhone: customer?.phone || "",
      accountUrl: "/account",
      signinUrl: "/signin",
    },
    fallbackErrorCode: "WELCOME_EMAIL_FAILED",
  });
}

export async function sendPasswordResetEmail(customer, request) {
  const baseUrl = baseUrlFromRequest(request);
  const resetUrl = `${baseUrl}/signin`;

  return sendLifecycleEmail({
    templateSlug: PASSWORD_RESET_TEMPLATE_SLUG,
    customer,
    variables: {
      brandName: "JPSPARE",
      customerName: customerName(customer),
      customerEmail: customer?.email || "",
      resetUrl,
      signinUrl: resetUrl,
    },
    fallbackErrorCode: "PASSWORD_RESET_EMAIL_FAILED",
  });
}
