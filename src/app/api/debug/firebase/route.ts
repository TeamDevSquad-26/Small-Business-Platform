import { NextResponse } from "next/server";
import {
  FIREBASE_PUBLIC_ENV_KEYS,
  getMissingFirebasePublicEnvKeys,
} from "@/lib/firebase/env";

/** Dev-only: which public config keys are missing (no secret values). */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const missing = getMissingFirebasePublicEnvKeys();
  const present = FIREBASE_PUBLIC_ENV_KEYS.filter((k) => !missing.includes(k));

  return NextResponse.json({
    ok: missing.length === 0,
    missing,
    present,
  });
}
