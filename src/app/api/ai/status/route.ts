import { NextResponse } from "next/server";
import { isOpenAiConfigured } from "@/lib/ai/product-draft-server";

/**
 * Public capability flags for client UI (no secrets exposed).
 */
export async function GET() {
  return NextResponse.json({
    productDraft: isOpenAiConfigured(),
  });
}
