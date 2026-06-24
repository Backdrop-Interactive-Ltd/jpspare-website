import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "../db";
import { getCustomerSession } from "../auth/customer-session";

export const GUEST_CART_COOKIE = "jpspare_guest_id";
const cartProductInclude = { brand: true };
const cartItemsInclude = { items: { include: { product: { include: cartProductInclude } } } };
const orderedCartItemsInclude = { items: { include: { product: { include: cartProductInclude } }, orderBy: { createdAt: "desc" } } };

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

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getGeneratedRegularPrice(product, unitPrice) {
  if (!unitPrice) return null;
  const productKey = product?.id || product?.slug || product?.title || "";
  let hash = 0;

  for (let index = 0; index < productKey.length; index += 1) {
    hash = (hash * 31 + productKey.charCodeAt(index)) % 9973;
  }

  const generatedDiscount = [12, 16, 21, 24, 29][hash % 5];
  return Math.round(unitPrice / (1 - generatedDiscount / 100));
}

function inferProductBrand(value) {
  const name = String(value || "");
  const knownBrands = ["Liqui Moly", "Flamingo", "Kangaroo", "Philips", "Yesido", "Joyroom", "MOXOM", "Chevron", "TOKICO", "DENSO", "Mobil", "Brembo", "Michelin"];
  return knownBrands.find((brand) => name.toLowerCase().includes(brand.toLowerCase())) || null;
}

function inferFreeDelivery(product, brandName) {
  return Boolean(product?.freeDelivery || product?.freeDeliveryEligible);
}

export function serializeCart(cart) {
  if (!cart) {
    return { id: null, items: [], subtotal: 0, count: 0 };
  }

  const items = (cart.items || []).map((item) => {
    const unitPrice = toNumber(item.unitPrice) || 0;
    const productPrice = toNumber(item.product?.price);
    const compareAtPrice = toNumber(item.product?.compareAtPrice);
    const regularPrice = compareAtPrice && compareAtPrice > unitPrice
      ? compareAtPrice
      : productPrice && productPrice > unitPrice
        ? productPrice
        : getGeneratedRegularPrice(item.product, unitPrice);
    const brandName = item.product?.brand?.name || inferProductBrand(item.productTitle);
    const freeDelivery = inferFreeDelivery(item.product, brandName);

    return {
      id: item.id,
      productId: item.productId,
      slug: item.product?.slug || slugify(item.productTitle),
      title: item.productTitle,
      name: item.productTitle,
      sku: item.sku,
      brand: brandName,
      brandName,
      freeDelivery,
      freeDeliveryEligible: freeDelivery,
      image: item.imageUrl,
      price: unitPrice,
      unitPrice,
      regularPrice,
      regularLineTotal: regularPrice ? regularPrice * item.quantity : null,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
    };
  });

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
      include: cartItemsInclude,
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
          include: cartItemsInclude,
        });
      }
    }

    return prisma.cart.create({
      data: { customerId: customer.id },
      include: cartItemsInclude,
    });
  }

  const guestCart = await prisma.cart.findFirst({
    where: { guestId, status: "ACTIVE" },
    include: cartItemsInclude,
    orderBy: { updatedAt: "desc" },
  });

  if (guestCart) {
    return guestCart;
  }

  return prisma.cart.create({
    data: { guestId },
    include: cartItemsInclude,
  });
}

export async function getActiveCart() {
  const { customer, guestId } = await getCommerceIdentity();

  const cart = await prisma.cart.findFirst({
    where: customer ? { customerId: customer.id, status: "ACTIVE" } : { guestId, status: "ACTIVE" },
    include: orderedCartItemsInclude,
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
    include: orderedCartItemsInclude,
  });
}

export async function resolveCartProduct(payload = {}) {
  const fallback = payload.product || payload;
  const productId = payload.productId || payload.id || fallback.productId || fallback.id;
  const slug = payload.slug || fallback.slug;
  let product = null;

  if (productId) {
    product = await prisma.product.findUnique({
      where: { id: productId },
      include: { brand: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, media: { include: { media: true }, take: 1 } },
    });
  } else if (slug) {
    product = await prisma.product.findUnique({
      where: { slug },
      include: { brand: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, media: { include: { media: true }, take: 1 } },
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

  return {
    productId: null,
    title: fallback.title || fallback.name || "JPSPARE Product",
    sku: fallback.sku || null,
    imageUrl: fallback.image || fallback.imageUrl || null,
    unitPrice: parseMoney(fallback.price || fallback.unitPrice || 0),
    freeDelivery: Boolean(fallback.freeDelivery || fallback.freeDeliveryEligible),
    freeDeliveryEligible: Boolean(fallback.freeDelivery || fallback.freeDeliveryEligible),
  };
}
