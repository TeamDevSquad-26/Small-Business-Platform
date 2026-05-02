import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { PRODUCT_CATEGORIES } from "@/lib/products/categories";
import {
  ALLOWED_IMAGE_MIMES,
  fetchTrustedProductImageAsBase64,
  isTrustedProductImageUrl,
} from "@/lib/ai/product-draft-server";

const MAX_IMAGE_BASE64_CHARS = 7_500_000;

type DraftBody = {
  workingTitle?: string;
  imageBase64?: string;
  imageMimeType?: string;
  /** Existing Cloudinary / Firebase Storage HTTPS URL for this shop’s product (edit flow). */
  imageUrl?: string;
};

type ParsedDraft = {
  name: string;
  description: string;
  suggestedCategory: string;
  suggestedTags: string[];
};

function normalizeCategory(raw: unknown): string {
  const t = String(raw ?? "").trim();
  const allowed = PRODUCT_CATEGORIES as readonly string[];
  if (allowed.includes(t)) return t;
  const lower = t.toLowerCase();
  const found = PRODUCT_CATEGORIES.find((c) => c.toLowerCase() === lower);
  if (found) return found;
  return PRODUCT_CATEGORIES[0];
}

function parseDraftJson(content: string): ParsedDraft | null {
  const trimmed = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  try {
    const o = JSON.parse(trimmed) as Record<string, unknown>;
    const name = String(o.name ?? "").trim();
    const description = String(o.description ?? "").trim();
    const suggestedCategory = normalizeCategory(o.suggestedCategory);
    const tagsRaw = o.suggestedTags;
    const suggestedTags = Array.isArray(tagsRaw)
      ? tagsRaw.map((x) => String(x).trim().toLowerCase()).filter(Boolean).slice(0, 12)
      : [];
    if (!name || !description) return null;
    return { name, description, suggestedCategory, suggestedTags };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const adminAuth = getAdminAuth();
  const db = getAdminFirestore();

  if (!adminAuth) {
    return NextResponse.json({ error: "Server authentication is not configured." }, { status: 503 });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI is not configured. Add OPENAI_API_KEY on the server." },
      { status: 503 }
    );
  }

  if (!db) {
    return NextResponse.json({ error: "Server database is not configured." }, { status: 503 });
  }

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(header.slice(7));
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const shopsSnap = await db.collection("shops").where("ownerId", "==", uid).limit(1).get();
  if (shopsSnap.empty) {
    return NextResponse.json(
      { error: "Create a shop before using AI listing drafts." },
      { status: 403 }
    );
  }
  const shopId = shopsSnap.docs[0].id;

  let body: DraftBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const workingTitle = String(body.workingTitle ?? "").trim();
  let imageBase64 = String(body.imageBase64 ?? "").trim();
  const imageMimeRaw = String(body.imageMimeType ?? "").trim();
  const imageUrlRaw = String(body.imageUrl ?? "").trim();

  if (imageBase64.length > MAX_IMAGE_BASE64_CHARS) {
    return NextResponse.json({ error: "Image is too large for AI. Use a smaller photo." }, { status: 400 });
  }

  let imageMimeType = "image/jpeg";

  if (imageBase64) {
    const m = imageMimeRaw.split(";")[0]?.trim().toLowerCase() || "image/jpeg";
    if (!ALLOWED_IMAGE_MIMES.has(m)) {
      return NextResponse.json(
        { error: "Unsupported image type. Use JPEG, PNG, WebP, or GIF." },
        { status: 400 }
      );
    }
    imageMimeType = m;
  } else if (imageUrlRaw) {
    const trusted = isTrustedProductImageUrl(imageUrlRaw, shopId);
    if (!trusted) {
      return NextResponse.json(
        {
          error:
            "Image URL must be HTTPS and belong to your shop (Cloudinary or Firebase Storage upload path).",
        },
        { status: 400 }
      );
    }
    const fetched = await fetchTrustedProductImageAsBase64(trusted);
    if (!fetched) {
      return NextResponse.json(
        { error: "Could not load image from URL. Re-upload the photo or try again." },
        { status: 400 }
      );
    }
    imageBase64 = fetched.base64;
    imageMimeType = fetched.mime;
  }

  if (!workingTitle && !imageBase64) {
    return NextResponse.json(
      { error: "Add a working title and/or product photo to generate a draft." },
      { status: 400 }
    );
  }

  const catList = PRODUCT_CATEGORIES.join(", ");

  const system = `You help Pakistani small-business sellers write product listings for Karobaar.pk. Buyers may read English, Urdu, or Roman Urdu — write the listing body in clear English (friendly, trustworthy). Respond with ONLY valid JSON (no markdown fences) using exactly these keys: "name" (short product title), "description" (2–5 sentences; highlight materials, sizing/care if visible, delivery-friendly tone), "suggestedCategory" (must be exactly one of: ${catList}), "suggestedTags" (array of 4–10 short lowercase keywords, no # symbol). Do not invent a price.`;

  let userText = "";
  if (workingTitle) {
    userText += `Seller working title / hint: "${workingTitle}"\n`;
  }
  if (!workingTitle && imageBase64) {
    userText += "Infer the product from the image.\n";
  }
  userText += `Pick suggestedCategory only from: ${catList}.`;

  const userContent:
    | string
    | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> =
    imageBase64
      ? [
          { type: "text", text: userText },
          {
            type: "image_url",
            image_url: { url: `data:${imageMimeType};base64,${imageBase64}` },
          },
        ]
      : userText;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        temperature: 0.65,
        max_tokens: 900,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[product-draft] OpenAI HTTP", res.status, errText.slice(0, 500));
      return NextResponse.json({ error: "AI request failed. Try again in a moment." }, { status: 502 });
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Empty AI response." }, { status: 502 });
    }

    const parsed = parseDraftJson(content);
    if (!parsed) {
      return NextResponse.json({ error: "Could not parse AI output. Try again." }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("[product-draft]", e);
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
}
