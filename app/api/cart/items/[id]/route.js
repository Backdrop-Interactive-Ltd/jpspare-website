import { NextResponse } from "next/server";
import { recalculateCart, serializeCart } from "../../../../../lib/commerce/cart";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const quantity = Math.max(1, Number(body.quantity || 1));
  const item = await prisma.cartItem.update({
    where: { id },
    data: { quantity },
  });
  const cart = await recalculateCart(item.cartId);

  return NextResponse.json({ cart: serializeCart(cart) });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const item = await prisma.cartItem.findUnique({ where: { id } });

  if (!item) {
    return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id } });
  const cart = await recalculateCart(item.cartId);

  return NextResponse.json({ cart: serializeCart(cart) });
}

