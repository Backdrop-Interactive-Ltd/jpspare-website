import { NextResponse } from "next/server";
import { getCommerceIdentity, parseMoney } from "../../../lib/commerce/cart";
import { prisma } from "../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeWishlist(items) {
  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    title: item.productTitle,
    name: item.productTitle,
    sku: item.sku,
    image: item.imageUrl,
    price: item.unitPrice ? Number(item.unitPrice) : null,
    productUrl: item.productUrl,
    added: item.createdAt,
  }));
}

export async function GET() {
  const { customer, guestId } = await getCommerceIdentity();
  const items = await prisma.wishlistItem.findMany({
    where: customer ? { customerId: customer.id } : { guestId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items: serializeWishlist(items) });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { customer, guestId } = await getCommerceIdentity();
  const title = body.title || body.name || body.productTitle || "JPSPARE Product";
  const productId = body.productId || null;

  const existing = await prisma.wishlistItem.findFirst({
    where: customer
      ? { customerId: customer.id, ...(productId ? { productId } : { productTitle: title }) }
      : { guestId, ...(productId ? { productId } : { productTitle: title }) },
  });

  if (!existing) {
    await prisma.wishlistItem.create({
      data: {
        customerId: customer?.id || null,
        guestId: customer ? null : guestId,
        productId,
        productTitle: title,
        sku: body.sku || null,
        imageUrl: body.image || body.imageUrl || null,
        unitPrice: body.price ? parseMoney(body.price) : null,
        productUrl: body.productUrl || null,
      },
    });
  }

  const items = await prisma.wishlistItem.findMany({
    where: customer ? { customerId: customer.id } : { guestId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items: serializeWishlist(items) });
}

