// Debug endpoint removed for production.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "not available" }, { status: 404 });
}
