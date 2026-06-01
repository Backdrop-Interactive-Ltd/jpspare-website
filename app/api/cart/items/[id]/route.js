import { NextResponse } from "next/server";
import {
  getActiveCart,
  recalculateCart,
  serializeCart,
} from "../../../../../lib/commerce/cart";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const quantity = Math.max(1, Number(body.quantity || 1));

  const cart = await getActiveCart();
  if (!cart) {
    return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { id, cartId: cart.id },
  });

  if (!existingItem) {
    return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
  }

  const item = await prisma.cartItem.update({
    where: { id },
    data: { quantity },
  });
  const updatedCart = await recalculateCart(item.cartId);

  return NextResponse.json({ cart: serializeCart(updatedCart) });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;

  const cart = await getActiveCart();
  if (!cart) {
    return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
  }

  const item = await prisma.cartItem.findFirst({
    where: { id, cartId: cart.id },
  });

  if (!item) {
    return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id } });
  const updatedCart = await recalculateCart(item.cartId);

  return NextResponse.json({ cart: serializeCart(updatedCart) });
}
