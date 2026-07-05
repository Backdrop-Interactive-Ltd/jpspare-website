import { sendNotification } from "./send-notification";

const COMPANY_NAME = "JPSPARE";
const ORDER_NOTIFICATION_EVENTS = {
  ORDER_PLACED: {
    statuses: ["PENDING"],
    templateSlug: "order-placed-notification",
    channels: ["EMAIL", "IN_APP"],
  },
  ORDER_CONFIRMED: {
    statuses: ["CONFIRMED"],
    templateSlug: "order-confirmed-notification",
    channels: ["EMAIL", "IN_APP"],
  },
  ORDER_SHIPPED: {
    statuses: ["SHIPPED"],
    templateSlug: "order-shipped-notification",
    channels: ["EMAIL", "SMS", "IN_APP"],
  },
  ORDER_DELIVERED: {
    statuses: ["DELIVERED"],
    templateSlug: "order-delivered-notification",
    channels: ["EMAIL", "IN_APP"],
  },
};

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

function cleanString(value) {
  return String(value || "").trim();
}

function serializeAddress(address) {
  if (!address || typeof address !== "object") return {};
  return address;
}

function orderCustomerName(order) {
  const billingAddress = serializeAddress(order?.billingAddress);
  const customerName = cleanString(order?.customerName || billingAddress.fullName);
  if (customerName) return customerName;

  const firstName = cleanString(order?.customer?.firstName);
  const lastName = cleanString(order?.customer?.lastName);
  return [firstName, lastName].filter(Boolean).join(" ") || "Customer";
}

function orderEmail(order) {
  const billingAddress = serializeAddress(order?.billingAddress);
  return cleanString(order?.customerEmail || order?.customer?.email || billingAddress.email).toLowerCase();
}

function orderPhone(order) {
  const billingAddress = serializeAddress(order?.billingAddress);
  return cleanString(order?.customerPhone || order?.customer?.phone || billingAddress.phone);
}

function orderVariables(order, extras = {}) {
  return {
    customerName: orderCustomerName(order),
    orderNumber: cleanString(order?.orderNumber),
    total: formatMoney(order?.total),
    totalRaw: moneyValue(order?.total),
    status: cleanString(order?.status),
    orderUrl: order?.orderNumber ? `/checkout/success/${order.orderNumber}` : "",
    companyName: COMPANY_NAME,
    trackingNumber: cleanString(extras.trackingNumber),
    courierName: cleanString(extras.courierName),
  };
}

async function safeSend(payload) {
  try {
    return await sendNotification(payload);
  } catch (error) {
    return {
      sent: false,
      error: error?.code || error?.message || "ORDER_NOTIFICATION_FAILED",
    };
  }
}

async function sendOrderEventNotifications({ order, event, extras = {} }) {
  const config = ORDER_NOTIFICATION_EVENTS[event];
  if (!config || !order?.id) {
    return { skipped: true, reason: "UNSUPPORTED_ORDER_NOTIFICATION_EVENT" };
  }

  const variables = orderVariables(order, extras);
  const email = orderEmail(order);
  const phone = orderPhone(order);
  const customerId = cleanString(order.customerId || order.customer?.id);
  const results = [];

  for (const channel of config.channels) {
    if (channel === "EMAIL") {
      results.push(
        await safeSend({
          channel,
          recipient: email,
          templateSlug: config.templateSlug,
          variables,
          customerId,
          actionUrl: variables.orderUrl,
        }),
      );
    }

    if (channel === "SMS") {
      results.push(
        await safeSend({
          channel,
          recipient: phone,
          templateSlug: config.templateSlug,
          variables,
          customerId,
          actionUrl: variables.orderUrl,
        }),
      );
    }

    if (channel === "IN_APP" && customerId) {
      results.push(
        await safeSend({
          channel,
          recipient: customerId,
          templateSlug: config.templateSlug,
          variables,
          customerId,
          actionUrl: variables.orderUrl,
        }),
      );
    }
  }

  return { event, results };
}

export async function notifyOrderPlaced(order) {
  try {
    return await sendOrderEventNotifications({ order, event: "ORDER_PLACED" });
  } catch (error) {
    return {
      sent: false,
      error: error?.code || error?.message || "ORDER_PLACED_NOTIFICATION_FAILED",
    };
  }
}

export async function notifyOrderStatusChanged(order, { previousStatus = null, trackingNumber = "", courierName = "" } = {}) {
  try {
    const status = cleanString(order?.status).toUpperCase();
    const previous = cleanString(previousStatus).toUpperCase();

    if (!status || status === previous) {
      return { skipped: true, reason: "ORDER_STATUS_UNCHANGED" };
    }

    const event = Object.entries(ORDER_NOTIFICATION_EVENTS).find(([, config]) => config.statuses.includes(status))?.[0];
    if (!event || event === "ORDER_PLACED") {
      return { skipped: true, reason: "ORDER_STATUS_NOT_NOTIFIABLE" };
    }

    return await sendOrderEventNotifications({
      order,
      event,
      extras: {
        trackingNumber,
        courierName,
      },
    });
  } catch (error) {
    return {
      sent: false,
      error: error?.code || error?.message || "ORDER_STATUS_NOTIFICATION_FAILED",
    };
  }
}
