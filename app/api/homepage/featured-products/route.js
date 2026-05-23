import { NextResponse } from "next/server";
import { getHomepageCms, getHomepageFeaturedProducts } from "../../../../lib/homepage/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cms = await getHomepageCms();
  const products = await getHomepageFeaturedProducts(cms);

  return NextResponse.json({ products });
}
