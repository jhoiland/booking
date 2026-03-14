// NextAuth removed. Auth handled via Supabase Auth.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "not available" }, { status: 404 });
}
