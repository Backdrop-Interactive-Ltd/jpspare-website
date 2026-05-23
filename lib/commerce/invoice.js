import { prisma } from "../db";
import { serializeOrder } from "./orders";

export const INVOICE_ROLES = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER", "SUPPORT_STAFF"];
export const INVOICE_FULL_ROLES = ["SUPER_ADMIN", "ADMIN", "ORDER_MANAGER"];

export function formatInvoiceMoney(value) {
  const number = Number(value || 0);
  return `BDT ${number.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatInvoiceLabel(value) {
  if (!value) return "N/A";
  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function makeInvoiceNumber(order) {
  const cleanOrder = String(order?.orderNumber || order?.id || Date.now())
    .replace(/[^a-z0-9]/gi, "")
    .slice(-14)
    .toUpperCase();
  return `INV-${cleanOrder}`;
}

export function addressLines(address, fallback = {}) {
  if (!address || typeof address !== "object") {
    return [fallback.name, fallback.phone, fallback.email].filter(Boolean);
  }

  return [
    address.fullName || fallback.name,
    address.phone || fallback.phone,
    address.email || fallback.email,
    address.addressLine1,
    address.addressLine2,
    [address.area, address.city, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ].filter(Boolean);
}

function timelineEntry({ title, message, actor, type = "INVOICE" }) {
  return {
    type,
    title,
    message,
    actor,
    at: new Date().toISOString(),
  };
}

function orderSupportsField(fieldName) {
  const fields = prisma?._runtimeDataModel?.models?.Order?.fields;
  if (!Array.isArray(fields)) return true;
  return fields.some((field) => field.name === fieldName);
}

function isUnknownInvoiceFieldError(error) {
  const message = String(error?.message || "");
  return (
    message.includes("Unknown argument `invoiceNumber`") ||
    message.includes("Unknown argument `invoiceGeneratedAt`") ||
    message.includes("Unknown argument `printedAt`")
  );
}

function withInvoiceDefaults(order, overrides = {}) {
  if (!order) return order;
  return {
    ...order,
    invoiceNumber: order.invoiceNumber || overrides.invoiceNumber || makeInvoiceNumber(order),
    invoiceGeneratedAt: order.invoiceGeneratedAt || overrides.invoiceGeneratedAt || order.createdAt,
    printedAt: order.printedAt || overrides.printedAt || null,
  };
}

async function updateOrderWithInvoiceFallback({ order, data, include, fallbackData = {} }) {
  try {
    return await prisma.order.update({
      where: { id: order.id },
      data,
      include,
    });
  } catch (error) {
    if (!isUnknownInvoiceFieldError(error)) {
      throw error;
    }

    const safeData = Object.fromEntries(
      Object.entries(data).filter(([key]) => !["invoiceNumber", "invoiceGeneratedAt", "printedAt"].includes(key))
    );

    if (Object.keys(safeData).length === 0) {
      return withInvoiceDefaults(order, fallbackData);
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: safeData,
      include,
    });

    return withInvoiceDefaults(updated, fallbackData);
  }
}

export async function getOrderForInvoice(identifier) {
  return prisma.order.findFirst({
    where: { OR: [{ id: identifier }, { orderNumber: identifier }] },
    include: { customer: true, items: true, payments: { orderBy: { createdAt: "desc" } } },
  });
}

export async function ensureOrderInvoice(identifier, actor = "System") {
  const existing = await getOrderForInvoice(identifier);
  if (!existing) return null;

  if (existing.invoiceNumber && existing.invoiceGeneratedAt) {
    return serializeOrder(existing);
  }

  const invoiceNumber = existing.invoiceNumber || makeInvoiceNumber(existing);
  const timeline = Array.isArray(existing.timeline) ? existing.timeline : [];
  const alreadyLogged = timeline.some(
    (entry) => entry?.type === "INVOICE" && entry?.title === "Invoice generated" && entry?.message?.includes(invoiceNumber)
  );
  const invoiceGeneratedAt = existing.invoiceGeneratedAt || new Date();
  const data = {
    timeline: alreadyLogged
      ? timeline
      : [
          ...timeline,
          timelineEntry({
            title: "Invoice generated",
            message: `Invoice ${invoiceNumber} was generated.`,
            actor,
          }),
        ],
  };

  if (orderSupportsField("invoiceNumber")) data.invoiceNumber = invoiceNumber;
  if (orderSupportsField("invoiceGeneratedAt")) data.invoiceGeneratedAt = invoiceGeneratedAt;

  const updated = await updateOrderWithInvoiceFallback({
    order: existing,
    data,
    include: { customer: true, items: true, payments: { orderBy: { createdAt: "desc" } } },
    fallbackData: { invoiceNumber, invoiceGeneratedAt },
  });

  return serializeOrder(withInvoiceDefaults(updated, { invoiceNumber, invoiceGeneratedAt }));
}

export async function markOrderPrinted(identifier, actor = "System", documentType = "Invoice") {
  const existing = await getOrderForInvoice(identifier);
  if (!existing) return null;

  const timeline = Array.isArray(existing.timeline) ? existing.timeline : [];
  const printedAt = new Date();
  const data = {
    timeline: [
      ...timeline,
      timelineEntry({
        title: `${documentType} printed`,
        message: `${documentType} print action was triggered.`,
        actor,
      }),
    ],
  };

  if (orderSupportsField("printedAt")) data.printedAt = printedAt;

  const updated = await updateOrderWithInvoiceFallback({
    order: existing,
    data,
    include: { customer: true, items: true, payments: { orderBy: { createdAt: "desc" } } },
    fallbackData: { printedAt },
  });

  return serializeOrder(withInvoiceDefaults(updated, { printedAt }));
}

function pdfEscape(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, " ");
}

function pdfText(value, x, y, size = 10, font = "F1") {
  return `BT /${font} ${size} Tf ${x} ${y} Td (${pdfEscape(value)}) Tj ET\n`;
}

function pdfLine(x1, y1, x2, y2) {
  return `${x1} ${y1} m ${x2} ${y2} l S\n`;
}

function buildPdf(content) {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

export function createInvoicePdf(order, type = "invoice") {
  const isPackingSlip = type === "packing-slip";
  const shipping = addressLines(order.shippingAddress, {
    name: order.customerName,
    phone: order.customerPhone,
    email: order.customerEmail,
  });
  const billing = addressLines(order.billingAddress, {
    name: order.customerName,
    phone: order.customerPhone,
    email: order.customerEmail,
  });

  let y = 790;
  let content = "0.8 w\n";
  content += pdfText("JPSPARE", 42, y, 24, "F2");
  content += pdfText(isPackingSlip ? "PACKING SLIP" : "TAX INVOICE", 390, y + 3, 18, "F2");
  y -= 34;
  content += pdfText(`Order: ${order.orderNumber}`, 42, y, 10, "F2");
  content += pdfText(`Invoice: ${order.invoiceNumber || "Pending"}`, 390, y, 10, "F2");
  y -= 18;
  content += pdfText(`Date: ${new Date(order.invoiceGeneratedAt || order.createdAt).toLocaleDateString("en-GB")}`, 390, y, 10);
  content += pdfLine(42, y - 14, 553, y - 14);

  y -= 45;
  content += pdfText("Customer", 42, y, 12, "F2");
  content += pdfText("Ship To", 320, y, 12, "F2");
  y -= 18;
  const maxAddressRows = Math.max(billing.length, shipping.length, 1);
  for (let index = 0; index < maxAddressRows; index += 1) {
    if (billing[index]) content += pdfText(billing[index], 42, y, 9);
    if (shipping[index]) content += pdfText(shipping[index], 320, y, 9);
    y -= 14;
  }

  y -= 18;
  content += pdfLine(42, y + 16, 553, y + 16);
  content += pdfText("Item", 42, y, 10, "F2");
  content += pdfText("SKU", 295, y, 10, "F2");
  content += pdfText("Qty", 385, y, 10, "F2");
  if (!isPackingSlip) {
    content += pdfText("Unit", 430, y, 10, "F2");
    content += pdfText("Total", 505, y, 10, "F2");
  }
  y -= 14;
  content += pdfLine(42, y, 553, y);
  y -= 18;

  order.items.slice(0, 18).forEach((item) => {
    content += pdfText(String(item.productTitle).slice(0, 42), 42, y, 9);
    content += pdfText(item.sku || "N/A", 295, y, 9);
    content += pdfText(item.quantity, 390, y, 9);
    if (!isPackingSlip) {
      content += pdfText(formatInvoiceMoney(item.unitPrice), 430, y, 9);
      content += pdfText(formatInvoiceMoney(item.total), 505, y, 9);
    }
    y -= 18;
  });

  if (!isPackingSlip) {
    y -= 8;
    content += pdfLine(335, y, 553, y);
    y -= 18;
    [
      ["Subtotal", order.subtotal],
      ["Delivery", order.deliveryCharge],
      ["Discount", order.discountTotal],
      ["Tax", order.taxTotal],
      ["Grand Total", order.total],
    ].forEach(([label, amount], index) => {
      content += pdfText(label, 375, y, 10, index === 4 ? "F2" : "F1");
      content += pdfText(formatInvoiceMoney(amount), 480, y, 10, index === 4 ? "F2" : "F1");
      y -= 16;
    });
  }

  y = Math.max(y, 88);
  content += pdfLine(42, y, 553, y);
  y -= 20;
  content += pdfText(`Order Status: ${formatInvoiceLabel(order.status)}`, 42, y, 10, "F2");
  if (!isPackingSlip) {
    content += pdfText(`Payment Status: ${formatInvoiceLabel(order.paymentStatus)}`, 320, y, 10, "F2");
  }
  y -= 26;
  content += pdfText("Thank you for choosing JPSPARE. Experience the authenticity.", 42, y, 9);

  return buildPdf(content);
}
