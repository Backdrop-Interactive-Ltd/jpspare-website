import { prisma } from "../db";

export const GATEWAY_READY_METHODS = ["CASH_ON_DELIVERY", "SSLCOMMERZ"];
export const FUTURE_GATEWAY_METHODS = ["BKASH", "NAGAD", "CARD", "STRIPE"];

export function paymentGatewayForMethod(method) {
  if (method === "SSLCOMMERZ") return "SSLCOMMERZ";
  if (method === "BKASH") return "BKASH";
  if (method === "NAGAD") return "NAGAD";
  if (method === "CARD" || method === "STRIPE") return "STRIPE";
  return null;
}

export function paymentMethodLabel(method) {
  const labels = {
    CASH_ON_DELIVERY: "Cash on Delivery",
    SSLCOMMERZ: "SSLCommerz",
    BKASH: "bKash",
    NAGAD: "Nagad",
    CARD: "Card",
    STRIPE: "Stripe",
    BANK_TRANSFER: "Bank Transfer",
  };
  return labels[method] || method;
}

export function isPaymentMethodEnabled(method) {
  return GATEWAY_READY_METHODS.includes(method);
}

function getSiteOrigin(request) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.SITE_URL ||
    new URL(request.url).origin
  ).replace(/\/$/, "");
}

function getSslCommerzConfig() {
  const sandbox = String(process.env.SSLCOMMERZ_SANDBOX ?? "true") !== "false";
  const storeId = process.env.SSLCOMMERZ_STORE_ID || "";
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD || process.env.SSLCOMMERZ_STORE_PASSWD || "";
  const forceMock = String(process.env.SSLCOMMERZ_MOCK || "").toLowerCase() === "true";

  return {
    sandbox,
    storeId,
    storePassword,
    mock: forceMock || !storeId || !storePassword,
    initUrl: sandbox
      ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
      : "https://securepay.sslcommerz.com/gwprocess/v4/api.php",
    validationUrl: sandbox
      ? "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
      : "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php",
  };
}

function cleanText(value, fallback = "") {
  return String(value || fallback).trim();
}

function cleanPhone(value) {
  const phone = cleanText(value, "01718914582").replace(/[^\d+]/g, "");
  return phone || "01718914582";
}

function gatewayTransactionId(order) {
  const base = `JPS-${order.orderNumber}-${Date.now()}`;
  return base.replace(/[^A-Za-z0-9-]/g, "").slice(0, 64);
}

function orderAddress(order, key) {
  const address = order?.[key];
  return address && typeof address === "object" ? address : {};
}

async function updatePaymentSession(order, data) {
  const latestPayment = order.payments?.[0];

  const updated = await prisma.order.update({
    where: { id: order.id },
    data,
    include: {
      customer: true,
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (latestPayment) {
    await prisma.payment.update({
      where: { id: latestPayment.id },
      data: {
        status: data.paymentStatus,
        transactionId: data.transactionId,
        gateway: data.paymentGateway,
        gatewayResponse: data.gatewayResponse,
        gatewayPayload: data.gatewayResponse,
        paymentMeta: data.paymentMeta,
      },
    });
  }

  return updated;
}

export async function initiateSslCommerzPayment(order, request) {
  const config = getSslCommerzConfig();
  const origin = getSiteOrigin(request);
  const transactionId = gatewayTransactionId(order);
  const billing = orderAddress(order, "billingAddress");
  const shipping = orderAddress(order, "shippingAddress");
  const amount = Number(order.total || 0).toFixed(2);

  const baseMeta = {
    gateway: "SSLCOMMERZ",
    sandbox: config.sandbox,
    mock: config.mock,
    initiatedAt: new Date().toISOString(),
  };

  if (config.mock) {
    const gatewayResponse = {
      mode: "mock",
      message: "SSLCommerz credentials are not configured. Using local sandbox mock redirect.",
      redirectUrl: `${origin}/api/payments/sslcommerz/success?tran_id=${encodeURIComponent(transactionId)}&mock=1`,
    };

    await updatePaymentSession(order, {
      paymentStatus: "PENDING",
      paymentGateway: "SSLCOMMERZ",
      transactionId,
      gatewayResponse,
      paymentMeta: baseMeta,
    });

    return {
      redirectUrl: gatewayResponse.redirectUrl,
      transactionId,
      gatewayResponse,
      mock: true,
    };
  }

  const payload = {
    store_id: config.storeId,
    store_passwd: config.storePassword,
    total_amount: amount,
    currency: order.currency || "BDT",
    tran_id: transactionId,
    success_url: `${origin}/api/payments/sslcommerz/success`,
    fail_url: `${origin}/api/payments/sslcommerz/fail`,
    cancel_url: `${origin}/api/payments/sslcommerz/cancel`,
    ipn_url: `${origin}/api/payments/sslcommerz/ipn`,
    cus_name: cleanText(order.customerName || billing.fullName, "JPSPARE Customer"),
    cus_email: cleanText(order.customerEmail || billing.email, "customer@jpspare.local"),
    cus_add1: cleanText(billing.addressLine1 || shipping.addressLine1, "Dhaka"),
    cus_add2: cleanText(billing.addressLine2 || shipping.addressLine2),
    cus_city: cleanText(billing.city || shipping.city, "Dhaka"),
    cus_state: cleanText(billing.area || shipping.area, "Dhaka"),
    cus_postcode: cleanText(billing.postalCode || shipping.postalCode, "1208"),
    cus_country: cleanText(billing.country || shipping.country, "Bangladesh"),
    cus_phone: cleanPhone(order.customerPhone || billing.phone),
    shipping_method: "Courier",
    ship_name: cleanText(shipping.fullName || order.customerName, "JPSPARE Customer"),
    ship_add1: cleanText(shipping.addressLine1 || billing.addressLine1, "Dhaka"),
    ship_add2: cleanText(shipping.addressLine2 || billing.addressLine2),
    ship_city: cleanText(shipping.city || billing.city, "Dhaka"),
    ship_state: cleanText(shipping.area || billing.area, "Dhaka"),
    ship_postcode: cleanText(shipping.postalCode || billing.postalCode, "1208"),
    ship_country: cleanText(shipping.country || billing.country, "Bangladesh"),
    product_name: order.items?.map((item) => item.productTitle).join(", ").slice(0, 240) || "JPSPARE Auto Parts",
    product_category: "Auto Parts",
    product_profile: "physical-goods",
    emi_option: "0",
    value_a: order.id,
    value_b: order.orderNumber,
    value_c: "WEB",
    value_d: "JPSPARE",
  };

  const response = await fetch(config.initUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(payload),
  });

  const gatewayResponse = await response.json().catch(() => ({}));
  const redirectUrl = gatewayResponse.GatewayPageURL || gatewayResponse.gatewayPageURL;

  if (!response.ok || !redirectUrl) {
    await updatePaymentSession(order, {
      paymentStatus: "FAILED",
      paymentGateway: "SSLCOMMERZ",
      transactionId,
      gatewayResponse,
      paymentMeta: { ...baseMeta, initFailedAt: new Date().toISOString() },
    });

    throw new Error(gatewayResponse.failedreason || "SSLCommerz could not start a payment session.");
  }

  await updatePaymentSession(order, {
    paymentStatus: "PENDING",
    paymentGateway: "SSLCOMMERZ",
    transactionId,
    gatewayResponse,
    paymentMeta: { ...baseMeta, sessionKey: gatewayResponse.sessionkey || null },
  });

  return { redirectUrl, transactionId, gatewayResponse, mock: false };
}

export async function readPaymentPayload(request) {
  const method = request.method || "GET";
  const contentType = request.headers.get("content-type") || "";
  const urlPayload = Object.fromEntries(new URL(request.url).searchParams.entries());

  if (method === "GET") {
    return urlPayload;
  }

  if (contentType.includes("application/json")) {
    return { ...urlPayload, ...((await request.json().catch(() => ({}))) || {}) };
  }

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return { ...urlPayload, ...Object.fromEntries(formData.entries()) };
  }

  const text = await request.text().catch(() => "");
  return { ...urlPayload, ...Object.fromEntries(new URLSearchParams(text)) };
}

export async function validateSslCommerzPayment(payload = {}) {
  const config = getSslCommerzConfig();
  const validationId = payload.val_id || payload.validation_id;

  if (payload.mock === "1") {
    return { ok: true, raw: { status: "VALID", mode: "mock" } };
  }

  if (!validationId || config.mock) {
    return { ok: false, raw: { status: payload.status || "UNVALIDATED", reason: "Missing validator credentials or val_id." } };
  }

  const params = new URLSearchParams({
    val_id: validationId,
    store_id: config.storeId,
    store_passwd: config.storePassword,
    format: "json",
  });
  const response = await fetch(`${config.validationUrl}?${params.toString()}`, { cache: "no-store" });
  const raw = await response.json().catch(() => ({}));
  const status = String(raw.status || "").toUpperCase();

  return {
    ok: response.ok && (status === "VALID" || status === "VALIDATED"),
    raw,
  };
}

export async function updateOrderPaymentFromGateway({ payload, status, validation = null }) {
  const transactionId = payload.tran_id || payload.tran_id_original || payload.bank_tran_id || payload.card_issuer_trans_id;
  const orderNumber = payload.value_b || payload.orderNumber;
  const orderId = payload.value_a || null;
  const where = {
    OR: [
      transactionId ? { transactionId } : null,
      orderNumber ? { orderNumber } : null,
      orderId ? { id: orderId } : null,
    ].filter(Boolean),
  };

  if (!where.OR.length) {
    return null;
  }

  const existing = await prisma.order.findFirst({
    where,
    include: {
      customer: true,
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!existing) return null;

  const paid = status === "PAID";
  const failedStatus = status === "CANCELLED" ? "CANCELLED" : "FAILED";
  const paymentStatus = paid ? "PAID" : failedStatus;
  const paidAt = paid ? new Date() : existing.paidAt;
  const gatewayResponse = {
    gateway: "SSLCOMMERZ",
    payload,
    validation: validation?.raw || null,
    receivedAt: new Date().toISOString(),
  };
  const timeline = Array.isArray(existing.timeline) ? existing.timeline : [];
  timeline.push({
    type: "PAYMENT",
    paymentStatus,
    title: paid ? "Payment confirmed" : status === "CANCELLED" ? "Payment cancelled" : "Payment failed",
    message: paid
      ? `SSLCommerz payment was confirmed for transaction ${transactionId || existing.transactionId || "N/A"}.`
      : `SSLCommerz returned ${paymentStatus.toLowerCase()} for transaction ${transactionId || existing.transactionId || "N/A"}.`,
    actor: "SSLCommerz",
    at: new Date().toISOString(),
  });

  const updated = await prisma.order.update({
    where: { id: existing.id },
    data: {
      paymentStatus,
      paymentGateway: "SSLCOMMERZ",
      transactionId: transactionId || existing.transactionId,
      paidAt,
      gatewayResponse,
      paymentMeta: {
        ...(existing.paymentMeta && typeof existing.paymentMeta === "object" ? existing.paymentMeta : {}),
        lastGatewayStatus: payload.status || paymentStatus,
        validationStatus: validation?.raw?.status || null,
      },
      timeline,
    },
    include: {
      customer: true,
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  const latestPayment = existing.payments?.find((payment) => payment.transactionId === transactionId) || existing.payments?.[0];
  if (latestPayment) {
    await prisma.payment.update({
      where: { id: latestPayment.id },
      data: {
        status: paymentStatus,
        transactionId: transactionId || latestPayment.transactionId,
        gateway: "SSLCOMMERZ",
        gatewayPayload: payload,
        gatewayResponse,
        paymentMeta: {
          validationStatus: validation?.raw?.status || null,
          paidVia: payload.card_type || payload.card_issuer || null,
        },
        paidAt,
      },
    });
  }

  return updated;
}
