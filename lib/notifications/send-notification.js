import { getActiveOtpProvider, sendSmsOtp } from "../auth/otp-delivery";
import { renderTemplateString } from "../email/render-template";
import { sendRenderedEmailWithSmtpProvider } from "../email/send-template-email";
import { prisma } from "../db";
import { createCustomerNotification } from "./customer-notifications";

const SUPPORTED_CHANNELS = new Set(["EMAIL", "SMS", "IN_APP"]);

function cleanString(value) {
  const clean = String(value || "").trim();
  return clean || "";
}

function normalizeChannel(channel) {
  const normalized = cleanString(channel).toUpperCase();
  if (!SUPPORTED_CHANNELS.has(normalized)) {
    throw new Error("Notification channel must be EMAIL, SMS, or IN_APP.");
  }
  return normalized;
}

function safeErrorMessage(error, fallback = "NOTIFICATION_SEND_FAILED") {
  return error?.code || error?.message || fallback;
}

function renderNotificationTemplate(template, variables = {}) {
  return {
    subject: template.subject ? renderTemplateString(template.subject, variables) : "",
    body: renderTemplateString(template.body, variables),
  };
}

async function createLog({ templateId, recipient, channel, status = "PENDING", errorMessage = null }) {
  return prisma.notificationLog.create({
    data: {
      ...(templateId ? { template: { connect: { id: templateId } } } : {}),
      recipient,
      channel,
      status,
      errorMessage,
    },
  });
}

async function failLog(logId, error) {
  if (!logId) return null;
  return prisma.notificationLog.update({
    where: { id: logId },
    data: {
      status: "FAILED",
      errorMessage: safeErrorMessage(error),
    },
  });
}

async function markLogSent(logId, result = {}) {
  if (!logId) return null;
  return prisma.notificationLog.update({
    where: { id: logId },
    data: {
      status: "SENT",
      provider: result.providerName || result.provider || null,
      providerMessageId: result.messageId || result.providerMessageId || null,
      sentAt: new Date(),
    },
  });
}

async function sendEmailNotification({ recipient, rendered }) {
  if (!recipient) {
    throw new Error("Email recipient is required.");
  }

  return sendRenderedEmailWithSmtpProvider({
    to: recipient,
    subject: rendered.subject || "JPSPARE Notification",
    html: rendered.body,
    text: rendered.body,
  });
}

async function sendSmsNotification({ recipient, rendered }) {
  if (!recipient) {
    throw new Error("SMS recipient is required.");
  }

  const provider = await getActiveOtpProvider("PHONE");
  const result = await sendSmsOtp({
    provider,
    identifier: recipient,
    otp: "",
    message: rendered.body,
  });

  return {
    ...result,
    providerName: result.providerName || provider.name,
    providerMessageId: result.statusCode ? String(result.statusCode) : null,
  };
}

async function sendInAppNotification({ recipient, customerId, rendered, actionUrl }) {
  const targetCustomerId = customerId || recipient;
  if (!targetCustomerId) {
    throw new Error("Customer ID is required for in-app notifications.");
  }

  const notification = await createCustomerNotification({
    customerId: targetCustomerId,
    title: rendered.subject || "JPSPARE Notification",
    body: rendered.body,
    actionUrl,
  });

  return {
    ok: true,
    providerName: "IN_APP",
    providerMessageId: notification.id,
    notification,
  };
}

export async function sendNotification({ channel, recipient, templateSlug, variables = {}, customerId = null, actionUrl = null } = {}) {
  const normalizedChannel = normalizeChannel(channel);
  const cleanRecipient = cleanString(recipient) || (normalizedChannel === "IN_APP" ? cleanString(customerId) : "");
  const cleanTemplateSlug = cleanString(templateSlug);

  if (!cleanTemplateSlug) {
    throw new Error("Notification template slug is required.");
  }

  const template = await prisma.notificationTemplate.findFirst({
    where: {
      slug: cleanTemplateSlug,
      channel: normalizedChannel,
      isActive: true,
    },
  });

  if (!template) {
    const log = await createLog({
      recipient: cleanRecipient || "unknown",
      channel: normalizedChannel,
      status: "FAILED",
      errorMessage: "NOTIFICATION_TEMPLATE_MISSING_OR_INACTIVE",
    });

    return {
      sent: false,
      logId: log.id,
      reason: "NOTIFICATION_TEMPLATE_MISSING_OR_INACTIVE",
    };
  }

  const rendered = renderNotificationTemplate(template, variables);
  const log = await createLog({
    templateId: template.id,
    recipient: cleanRecipient,
    channel: normalizedChannel,
  });

  try {
    let result;

    if (normalizedChannel === "EMAIL") {
      result = await sendEmailNotification({ recipient: cleanRecipient, rendered });
    } else if (normalizedChannel === "SMS") {
      result = await sendSmsNotification({ recipient: cleanRecipient, rendered });
    } else {
      result = await sendInAppNotification({
        recipient: cleanRecipient,
        customerId,
        rendered,
        actionUrl,
      });
    }

    await markLogSent(log.id, result);

    return {
      sent: true,
      logId: log.id,
      channel: normalizedChannel,
      provider: result.providerName || null,
      providerMessageId: result.messageId || result.providerMessageId || null,
      notification: result.notification || null,
    };
  } catch (error) {
    await failLog(log.id, error);

    return {
      sent: false,
      logId: log.id,
      channel: normalizedChannel,
      error: safeErrorMessage(error),
    };
  }
}
