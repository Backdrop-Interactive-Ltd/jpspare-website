import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(_request, { params }) {
  const { id } = await params;
  await prisma.wishlistItem.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}

