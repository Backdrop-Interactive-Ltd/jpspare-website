import { NextResponse } from "next/server";
import { getActiveCart, getOrCreateActiveCart, recalculateCart, resolveCartProduct, serializeCart } from "../../../lib/commerce/cart";
import { prisma } from "../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const cart = await getActiveCart();
  return NextResponse.json({ cart: serializeCart(cart) });
}

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const quantity = Math.max(1, Number(payload.quantity || 1));
  const product = await resolveCartProduct(payload);

  if (!product.title || !product.unitPrice) {
    return NextResponse.json({ error: "Valid product information is required." }, { status: 400 });
  }

  const cart = await getOrCreateActiveCart();
  const existing = await prisma.cartItem.findFirst({
    where: product.productId
      ? { cartId: cart.id, productId: product.productId }
      : { cartId: cart.id, productTitle: product.title },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity, unitPrice: product.unitPrice, imageUrl: product.imageUrl },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.productId,
        productTitle: product.title,
        sku: product.sku,
        imageUrl: product.imageUrl,
        unitPrice: product.unitPrice,
        quantity,
      },
    });
  }

  const updated = await recalculateCart(cart.id);
  return NextResponse.json({ cart: serializeCart(updated) });
}

export async function DELETE() {
  const cart = await getActiveCart();

  if (!cart) {
    return NextResponse.json({ cart: serializeCart(null) });
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  const updated = await recalculateCart(cart.id);
  return NextResponse.json({ cart: serializeCart(updated) });
}

