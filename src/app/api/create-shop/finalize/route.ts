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

  type Body = {
    shopName?: string;
    city?: string;
    description?: string;
    category?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    jazzCashNumber?: string;
    easyPaisaNumber?: string;
    logoUrl?: string;
    coverUrl?: string;
    name?: string;
  };

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const shopName = String(body.shopName ?? "").trim();
  const city = String(body.city ?? "").trim();
  const description = String(body.description ?? "").trim();
  const category = String(body.category ?? "").trim();
  const instagram = String(body.instagram ?? "").trim();
  const facebook = String(body.facebook ?? "").trim();
  const whatsapp = String(body.whatsapp ?? "").trim();
  const jazzCashNumber = String(body.jazzCashNumber ?? "").trim();
  const easyPaisaNumber = String(body.easyPaisaNumber ?? "").trim();
  const logoUrl = String(body.logoUrl ?? "").trim();
  const coverUrl = String(body.coverUrl ?? "").trim();
  const name = String(body.name ?? "").trim();

  if (!shopName || !city || !description || !category || !logoUrl || !coverUrl) {
    return NextResponse.json(
      {
        error:
          "shopName, city, description, category, logoUrl, and coverUrl are required.",
      },
      { status: 400 }
    );
  }
  if (!jazzCashNumber && !easyPaisaNumber) {
    return NextResponse.json(
      { error: "Add at least one payment number: jazzCashNumber or easyPaisaNumber." },
      { status: 400 }
    );
  }

  const shopRef = db.collection("shops").doc();

  const batch = db.batch();

  batch.set(shopRef, {
    shopId: shopRef.id,
    ownerId: uid,
    shopName,
    description,
    city,
    category,
    instagram,
    facebook,
    whatsapp,
    jazzCashNumber,
    easyPaisaNumber,
    logoUrl,
    coverUrl,
    createdAt: FieldValue.serverTimestamp(),
  });

  const userRef = db.collection("users").doc(uid);
  batch.set(
    userRef,
    {
      userId: uid,
      email,
      name,
      role: "shop_owner",
      updatedAt: FieldValue.serverTimestamp(),
      shopDraft: FieldValue.delete(),
    },
    { merge: true }
  );

  await batch.commit();

  return NextResponse.json({ ok: true, shopId: shopRef.id });
}
