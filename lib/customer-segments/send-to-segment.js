import { prisma } from "../db";
import { renderEmailTemplate, normalizeTemplateVariables } from "../email/render-template";
import { sendRenderedEmailWithSmtpProvider } from "../email/send-template-email";
import { sendNotification } from "../notifications/send-notification";
import { buildCustomerSegmentWhere, customerSegmentMetrics, evaluateCustomerSegmentRule } from "./evaluator";

const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 1000;
const SUPPORTED_NOTIFICATION_CHANNELS = new Set(["EMAIL", "SMS", "IN_APP"]);

function cleanString(value) {
  return String(value || "").trim();
}

function safeLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function customerName(customer) {
  return [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim() || "Customer";
}

function customerVariables(customer) {
  return {
    customerId: customer.id,
    customerName: customerName(customer),
    firstName: customer.firstName || "",
    lastName: customer.lastName || "",
    customerEmail: customer.email || "",
    customerPhone: customer.phone || "",
    customerStatus: customer.status || "",
    registeredAt: customer.createdAt?.toISOString?.() || "",
    lastLoginAt: customer.lastLoginAt?.toISOString?.() || "",
    metrics: customerSegmentMetrics(customer),
  };
}

function mergeVariables(baseVariables, customer, segment) {
  return normalizeTemplateVariables({
    ...baseVariables,
    ...customerVariables(customer),
    segment: {
      id: segment.id,
      name: segment.name,
      slug: segment.slug,
    },
  });
}

function safeErrorMessage(error, fallback = "SEGMENT_SEND_FAILED") {
  return error?.code || error?.message || fallback;
}

function normalizeChannel(channel) {
  const normalized = cleanString(channel || "IN_APP").toUpperCase();
  return SUPPORTED_NOTIFICATION_CHANNELS.has(normalized) ? normalized : "IN_APP";
}

async function getSegmentAudience(segment, { limit = DEFAULT_LIMIT } = {}) {
  const safeTake = safeLimit(limit);
  const rules = segment?.rulesJson && typeof segment.rulesJson === "object" && !Array.isArray(segment.rulesJson) ? segment.rulesJson : {};
  const customers = await prisma.customer.findMany({
    where: buildCustomerSegmentWhere(rules),
    orderBy: [{ createdAt: "desc" }],
    take: safeTake,
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      orders: {
        select: {
          id: true,
          total: true,
        },
      },
      vehicles: {
        select: {
          id: true,
        },
      },
    },
  });

  return customers.filter((customer) => evaluateCustomerSegmentRule(customer, rules));
}

async function sendEmailToCustomer({ template, customer, segment, variables }) {
  const recipientEmail = cleanString(customer.email).toLowerCase();
  if (!recipientEmail) {
    return { skipped: true, reason: "MISSING_RECIPIENT_EMAIL", customerId: customer.id };
  }

  const rendered = renderEmailTemplate(template, mergeVariables(variables, customer, segment));
  const log = await prisma.emailDeliveryLog.create({
    data: {
      template: { connect: { id: template.id } },
      recipientEmail,
      subject: rendered.subject,
      status: "PENDING",
    },
  });

  try {
    const result = await sendRenderedEmailWithSmtpProvider({
      to: recipientEmail,
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

    return { sent: true, logId: log.id, customerId: customer.id };
  } catch (error) {
    await prisma.emailDeliveryLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        errorMessage: safeErrorMessage(error, "SEGMENT_EMAIL_FAILED"),
      },
    });

    return { sent: false, logId: log.id, customerId: customer.id, error: safeErrorMessage(error, "SEGMENT_EMAIL_FAILED") };
  }
}

function notificationRecipient(customer, channel) {
  if (channel === "EMAIL") return cleanString(customer.email).toLowerCase();
  if (channel === "SMS") return cleanString(customer.phone);
  return customer.id;
}

async function sendNotificationToCustomer({ templateSlug, channel, customer, segment, variables, actionUrl }) {
  const recipient = notificationRecipient(customer, channel);
  if (!recipient) {
    return { skipped: true, reason: `MISSING_${channel}_RECIPIENT`, customerId: customer.id };
  }

  return sendNotification({
    channel,
    recipient,
    templateSlug,
    variables: mergeVariables(variables, customer, segment),
    customerId: customer.id,
    actionUrl,
  });
}

function summarizeResults(results) {
  return results.reduce(
    (summary, result) => {
      if (result?.sent) summary.sent += 1;
      else if (result?.skipped) summary.skipped += 1;
      else summary.failed += 1;
      return summary;
    },
    { sent: 0, failed: 0, skipped: 0 },
  );
}

export async function sendEmailToSegment({ segment, templateSlug, variables = {}, limit } = {}) {
  const cleanTemplateSlug = cleanString(templateSlug);
  if (!segment?.id) throw new Error("Customer segment is required.");
  if (!cleanTemplateSlug) throw new Error("Email template slug is required.");

  const template = await prisma.emailTemplate.findUnique({ where: { slug: cleanTemplateSlug } });
  if (!template || !template.isActive) {
    return {
      sent: 0,
      failed: 0,
      skipped: 0,
      audienceSize: 0,
      reason: "EMAIL_TEMPLATE_MISSING_OR_INACTIVE",
      results: [],
    };
  }

  const audience = await getSegmentAudience(segment, { limit });
  const results = [];

  for (const customer of audience) {
    results.push(await sendEmailToCustomer({ template, customer, segment, variables }));
  }

  return {
    ...summarizeResults(results),
    audienceSize: audience.length,
    results,
  };
}

export async function sendNotificationToSegment({ segment, templateSlug, channel = "IN_APP", variables = {}, actionUrl = null, limit } = {}) {
  const cleanTemplateSlug = cleanString(templateSlug);
  if (!segment?.id) throw new Error("Customer segment is required.");
  if (!cleanTemplateSlug) throw new Error("Notification template slug is required.");

  const normalizedChannel = normalizeChannel(channel);
  const audience = await getSegmentAudience(segment, { limit });
  const results = [];

  for (const customer of audience) {
    results.push(
      await sendNotificationToCustomer({
        templateSlug: cleanTemplateSlug,
        channel: normalizedChannel,
        customer,
        segment,
        variables,
        actionUrl,
      }),
    );
  }

  return {
    channel: normalizedChannel,
    ...summarizeResults(results),
    audienceSize: audience.length,
    results,
  };
}
