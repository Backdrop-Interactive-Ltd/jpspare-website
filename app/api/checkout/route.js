import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCustomerSession } from "../../../lib/auth/customer-session";
import { getOrCreateActiveCart } from "../../../lib/commerce/cart";
import { reserveOrderStock, validateAvailableStock } from "../../../lib/commerce/inventory";
import { createOrderNumber, normalizePaymentMethod, orderTotalFromCart, serializeOrder } from "../../../lib/commerce/orders";
import { FUTURE_GATEWAY_METHODS, initiateSslCommerzPayment, isPaymentMethodEnabled, paymentGatewayForMethod, paymentMethodLabel } from "../../../lib/commerce/payments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function cleanAddress(address = {}) {
  return {
    fullName: String(address.fullName || "").trim(),
    email: String(address.email || "").trim().toLowerCase(),
    phone: String(address.phone || "").trim(),
    addressLine1: String(address.addressLine1 || "").trim(),
    addressLine2: String(address.addressLine2 || "").trim(),
    city: String(address.city || "").trim(),
    area: String(address.area || "").trim(),
    postalCode: String(address.postalCode || "").trim(),
    country: String(address.country || "Bangladesh").trim(),
  };
}

function validateAddress(address) {
  const errors = {};

  if (!address.fullName) errors.fullName = "Full name is required.";
  if (!address.phone) errors.phone = "Phone number is required.";
  if (!address.email) errors.email = "Email address is required.";
  if (address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!address.addressLine1) errors.addressLine1 = "Delivery address is required.";
  if (!address.city) errors.city = "City is required.";
  if (!address.country) errors.country = "Country is required.";

  return errors;
}

function validationResponse(error, fieldErrors = {}, status = 400) {
  return NextResponse.json({ error, fieldErrors }, { status });
}

function normalizeCartItems(cart) {
  return (cart.items || [])
    .map((item) => ({
      productId: item.productId || null,
      productTitle: item.productTitle || "JPSPARE Product",
      sku: item.sku || null,
      imageUrl: item.imageUrl || null,
      quantity: Math.max(1, Number(item.quantity || 1)),
      unitPrice: Number(item.unitPrice || 0),
    }))
    .filter((item) => item.quantity > 0 && item.unitPrice >= 0);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const session = await getCustomerSession();
    const customer = session?.customer || null;
    const cart = await getOrCreateActiveCart();
    const items = normalizeCartItems(cart);

    if (!items.length) {
      return validationResponse("Your cart is empty. Please add products before checkout.");
    }

    const paymentMethod = normalizePaymentMethod(body.paymentMethod);
    const paymentGateway = paymentGatewayForMethod(paymentMethod);

    if (!isPaymentMethodEnabled(paymentMethod)) {
      const label = paymentMethodLabel(paymentMethod);
      const status = FUTURE_GATEWAY_METHODS.includes(paymentMethod) ? 501 : 422;
      return validationResponse(
        `${label} payment is ready in the architecture but not enabled yet. Please choose Cash on Delivery or SSLCommerz.`,
        { paymentMethod: `${label} is not enabled yet.` },
        status,
      );
    }

    const totals = orderTotalFromCart(cart);
    const billingAddress = cleanAddress(body.billingAddress);
    const shippingAddress = cleanAddress(body.shippingAddress || body.billingAddress);
    const fieldErrors = validateAddress(billingAddress);

    if (Object.keys(fieldErrors).length) {
      return validationResponse("Please fix the highlighted checkout fields.", fieldErrors, 422);
    }

    const stockError = await validateAvailableStock(items);

    if (stockError) {
      return validationResponse(stockError, {}, 409);
    }

    const orderNumber = createOrderNumber();
    const customerId = customer?.id || cart.customerId || null;
    const timeline = [
      {
        status: "PENDING",
        title: "Order created",
        message: "Order was placed from the JPSPARE storefront.",
        at: new Date().toISOString(),
      },
    ];

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          ...(customerId ? { customer: { connect: { id: customerId } } } : {}),
          ...(cart?.id ? { cart: { connect: { id: cart.id } } } : {}),
          status: "PENDING",
          paymentStatus: paymentMethod === "CASH_ON_DELIVERY" ? "UNPAID" : "PENDING",
          paymentGateway,
          paymentMeta: {
            selectedMethod: paymentMethod,
            gateway: paymentGateway,
            checkoutSource: "WEB",
            selectedAt: new Date().toISOString(),
          },
          subtotal: totals.subtotal,
          discountTotal: totals.discountTotal,
          deliveryCharge: totals.deliveryCharge,
          taxTotal: totals.taxTotal,
          total: totals.total,
          paymentMethod,
          customerEmail: customer?.email || billingAddress.email,
          customerName: customer?.name || billingAddress.fullName,
          customerPhone: customer?.phone || billingAddress.phone,
          billingAddress,
          shippingAddress,
          notes: body.notes || null,
          timeline,
          source: "WEB",
          syncStatus: "LOCAL",
          items: {
            create: items.map((item) => ({
              ...(item.productId ? { product: { connect: { id: item.productId } } } : {}),
              productTitle: item.productTitle,
              sku: item.sku,
              imageUrl: item.imageUrl,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: Number(item.unitPrice) * item.quantity,
            })),
          },
          payments: {
            create: {
              method: paymentMethod,
              status: paymentMethod === "CASH_ON_DELIVERY" ? "UNPAID" : "PENDING",
              amount: totals.total,
              gateway: paymentGateway,
              paymentMeta: {
                selectedMethod: paymentMethod,
                gateway: paymentGateway,
                checkoutSource: "WEB",
              },
              source: "WEB",
              syncStatus: "LOCAL",
            },
          },
        },
        include: { customer: true, items: true, payments: true },
      });

      await reserveOrderStock(tx, items, created, {
        reason: `Reserved during checkout for order ${created.orderNumber}`,
        source: "WEB",
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { status: "CONVERTED" },
      });

      return created;
    });

    let redirectUrl = `/checkout/success/${order.orderNumber}`;
    let paymentSession = null;

    if (paymentMethod === "SSLCOMMERZ") {
      paymentSession = await initiateSslCommerzPayment(order, request);
      redirectUrl = paymentSession.redirectUrl;
    }

    return NextResponse.json(
      {
        order: serializeOrder(order),
        redirectUrl,
        payment: paymentSession
          ? {
              method: paymentMethod,
              gateway: "SSLCOMMERZ",
              transactionId: paymentSession.transactionId,
              sandbox: true,
              mock: paymentSession.mock,
            }
          : {
              method: paymentMethod,
              gateway: paymentGateway,
            },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Checkout failed", error);
    return NextResponse.json(
      {
        error: "We could not save this order right now. Please try again or contact support.",
      },
      { status: 500 },
    );
  }
}
