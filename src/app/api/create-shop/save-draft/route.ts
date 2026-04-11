import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  const db = getAdminFirestore();
  const adminAuth = getAdminAuth();
  if (!db || !adminAuth) {
    return NextResponse.json(
      { ok: false, reason: "server_admin_not_configured" },
      { status: 503 }
    );
  }

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  }

  let uid: string;
  let email = "";
  try {
    const decoded = await adminAuth.verifyIdToken(header.slice(7));
    uid = decoded.uid;
    email = (decoded.email as string) ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  let body: { shopName?: string; city?: string; description?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const shopName = String(body.shopName ?? "").trim();
  const city = String(body.city ?? "").trim();
  const description = String(body.description ?? "").trim();
  const name = String(body.name ?? "").trim();

  if (!shopName || !city || !description) {
    return NextResponse.json(
      { error: "shopName, city, and description are required." },
      { status: 400 }
    );
  }

  const userRef = db.collection("users").doc(uid);
  const existing = await userRef.get();

  const payload: Record<string, unknown> = {
    userId: uid,
    email,
    name,
    shopDraft: {
      shopName,
      city,
      description,
      savedStep: 1,
      updatedAt: FieldValue.serverTimestamp(),
    },
  };

  if (!existing.exists) {
    payload.role = "customer";
  }

  await userRef.set(payload, { merge: true });

  return NextResponse.json({ ok: true });
}
