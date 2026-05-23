import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "../db";
import { getCustomerSession } from "../auth/customer-session";

export const GUEST_CART_COOKIE = "jpspare_guest_id";

export function parseMoney(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  const match = String(value).replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

export function toNumber(value) {
  return value === null || value === undefined ? null : Number(value);
}

export function serializeCart(cart) {
  if (!cart) {
    return { id: null, items: [], subtotal: 0, count: 0 };
  }

  const items = (cart.items || []).map((item) => ({
    id: item.id,
    productId: item.productId,
    title: item.productTitle,
    name: item.productTitle,
    sku: item.sku,
    image: item.imageUrl,
    price: toNumber(item.unitPrice) || 0,
    unitPrice: toNumber(item.unitPrice) || 0,
    quantity: item.quantity,
    lineTotal: (toNumber(item.unitPrice) || 0) * item.quantity,
  }));

  return {
    id: cart.id,
    items,
    subtotal: toNumber(cart.subtotal) || items.reduce((total, item) => total + item.lineTotal, 0),
    count: items.reduce((total, item) => total + item.quantity, 0),
  };
}

export async function getCommerceIdentity() {
  const cookieStore = await cookies();
  const session = await getCustomerSession();
  let guestId = cookieStore.get(GUEST_CART_COOKIE)?.value;

  if (!session && !guestId) {
    guestId = randomUUID();
    cookieStore.set(GUEST_CART_COOKIE, guestId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return { customer: session?.customer || null, guestId };
}

export async function getOrCreateActiveCart() {
  const { customer, guestId } = await getCommerceIdentity();

  if (customer) {
    const customerCart = await prisma.cart.findFirst({
      where: { customerId: customer.id, status: "ACTIVE" },
      include: { items: true },
      orderBy: { updatedAt: "desc" },
    });

    if (customerCart) {
      return customerCart;
    }

    if (guestId) {
      const guestCart = await prisma.cart.findFirst({
        where: { guestId, status: "ACTIVE" },
        include: { items: true },
        orderBy: { updatedAt: "desc" },
      });

      if (guestCart) {
        return prisma.cart.update({
          where: { id: guestCart.id },
          data: { customerId: customer.id, guestId: null },
          include: { items: true },
        });
      }
    }

    return prisma.cart.create({
      data: { customerId: customer.id },
      include: { items: true },
    });
  }

  const guestCart = await prisma.cart.findFirst({
    where: { guestId, status: "ACTIVE" },
    include: { items: true },
    orderBy: { updatedAt: "desc" },
  });

  if (guestCart) {
    return guestCart;
  }

  return prisma.cart.create({
    data: { guestId },
    include: { items: true },
  });
}

export async function getActiveCart() {
  const { customer, guestId } = await getCommerceIdentity();

  const cart = await prisma.cart.findFirst({
    where: customer ? { customerId: customer.id, status: "ACTIVE" } : { guestId, status: "ACTIVE" },
    include: { items: { orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });

  return cart;
}

export async function recalculateCart(cartId) {
  const items = await prisma.cartItem.findMany({ where: { cartId } });
  const subtotal = items.reduce((total, item) => total + Number(item.unitPrice) * item.quantity, 0);

  return prisma.cart.update({
    where: { id: cartId },
    data: { subtotal },
    include: { items: { orderBy: { createdAt: "desc" } } },
  });
}

export async function resolveCartProduct(payload = {}) {
  const productId = payload.productId || payload.id;
  const slug = payload.slug;
  let product = null;

  if (productId) {
    product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, media: { include: { media: true }, take: 1 } },
    });
  } else if (slug) {
    product = await prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, media: { include: { media: true }, take: 1 } },
    });
  }

  if (product) {
    return {
      productId: product.id,
      title: product.title,
      sku: product.sku,
      imageUrl: product.images?.[0]?.url || product.media?.[0]?.media?.url || null,
      unitPrice: Number(product.discountPrice || product.price),
    };
  }

  const fallback = payload.product || payload;

  return {
    productId: null,
    title: fallback.title || fallback.name || "JPSPARE Product",
    sku: fallback.sku || null,
    imageUrl: fallback.image || fallback.imageUrl || null,
    unitPrice: parseMoney(fallback.price || fallback.unitPrice || 0),
  };
}

