import { NextResponse } from "next/server";
import { getCommerceIdentity } from "../../../../lib/commerce/cart";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const { customer, guestId } = await getCommerceIdentity();
  const where = customer ? { id, customerId: customer.id } : { id, guestId };
  const deleted = await prisma.wishlistItem.deleteMany({ where });

  if (!deleted.count) {
    return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
