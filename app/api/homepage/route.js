import { NextResponse } from "next/server";
import { getHomepageCms } from "../../../lib/homepage/cms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const cms = await getHomepageCms();
  return NextResponse.json({ cms });
}
