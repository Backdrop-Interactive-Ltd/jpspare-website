import { prisma } from "../db.js";
import { renderEmailTemplate } from "./render-template.js";
import { sendRenderedEmailWithSmtpProvider } from "./send-template-email.js";

const ORDER_PLACED_TEMPLATE_SLUG = "order-placed";

function moneyValue(value) {
  const number = Number(typeof value?.toString === "function" ? value.toString() : value);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
  return moneyValue(value).toLocaleString("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  });
}

function serializeAddress(address) {
  if (!address || typeof address !== "object") return {};
  return {
    fullName: address.fullName || "",
    email: address.email || "",
    phone: address.phone || "",
    addressLine1: address.addressLine1 || "",
    addressLine2: address.addressLine2 || "",
    city: address.city || "",
    area: address.area || "",
    postalCode: address.postalCode || "",
    country: address.country || "",
  };
}

function orderEmailVariables(order) {
  const items = (order.items || []).map((item) => ({
    productTitle: item.productTitle || "JPSPARE Product",
    sku: item.sku || "",
    quantity: item.quantity || 0,
    unitPrice: moneyValue(item.unitPrice),
    unitPriceFormatted: formatMoney(item.unitPrice),
    total: moneyValue(item.total),
    totalFormatted: formatMoney(item.total),
  }));
  const billingAddress = serializeAddress(order.billingAddress);
  const shippingAddress = serializeAddress(order.shippingAddress);

  return {
    brandName: "JPSPARE",
    orderNumber: order.orderNumber,
    customerName: order.customerName || billingAddress.fullName || "Customer",
    customerEmail: order.customerEmail || billingAddress.email || "",
    customerPhone: order.customerPhone || billingAddress.phone || "",
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    subtotal: moneyValue(order.subtotal),
    subtotalFormatted: formatMoney(order.subtotal),
    discountTotal: moneyValue(order.discountTotal),
    discountTotalFormatted: formatMoney(order.discountTotal),
    deliveryCharge: moneyValue(order.deliveryCharge),
    deliveryChargeFormatted: formatMoney(order.deliveryCharge),
    taxTotal: moneyValue(order.taxTotal),
    taxTotalFormatted: formatMoney(order.taxTotal),
    total: moneyValue(order.total),
    totalFormatted: formatMoney(order.total),
    itemCount: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    items,
    billingAddress,
    shippingAddress,
    orderUrl: `/checkout/success/${order.orderNumber}`,
    createdAt: order.createdAt?.toISOString?.() || new Date().toISOString(),
  };
}

function safeErrorMessage(error) {
  return error?.code || error?.message || "ORDER_PLACED_EMAIL_FAILED";
}

export async function sendOrderPlacedEmail(order) {
  try {
    const recipientEmail = String(order?.customerEmail || order?.billingAddress?.email || "").trim().toLowerCase();

    if (!order?.id || !recipientEmail) {
      return { skipped: true, reason: "MISSING_ORDER_OR_RECIPIENT" };
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { slug: ORDER_PLACED_TEMPLATE_SLUG },
    });

    if (!template || !template.isActive) {
      return { skipped: true, reason: "ORDER_PLACED_TEMPLATE_MISSING_OR_INACTIVE" };
    }

    const rendered = renderEmailTemplate(template, orderEmailVariables(order));
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

      return { sent: true, logId: log.id };
    } catch (error) {
      await prisma.emailDeliveryLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          errorMessage: safeErrorMessage(error),
        },
      });

      return { sent: false, logId: log.id, error: safeErrorMessage(error) };
    }
  } catch (error) {
    return { skipped: true, reason: safeErrorMessage(error) };
  }
}
