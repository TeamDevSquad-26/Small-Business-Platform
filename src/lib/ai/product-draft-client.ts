import { getFirebaseCurrentUserWhenReady } from "@/lib/firebase/client";

export async function fetchAiFeatureStatus(): Promise<{ productDraft: boolean }> {
  try {
    const res = await fetch("/api/ai/status", { cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as { productDraft?: unknown };
    return { productDraft: Boolean(data.productDraft) };
  } catch {
    return { productDraft: false };
  }
}

export type ProductDraftResult = {
  name: string;
  description: string;
  suggestedCategory: string;
  suggestedTags: string[];
};

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      if (typeof r !== "string") {
        reject(new Error("Could not read image."));
        return;
      }
      const comma = r.indexOf(",");
      resolve(comma >= 0 ? r.slice(comma + 1) : r);
    };
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

/**
 * Calls `/api/ai/product-draft` with Firebase ID token.
 * Pass a working title and/or image — server requires at least one.
 */
export async function requestProductDraft(opts: {
  workingTitle: string;
  imageFile: File | null;
  /** HTTPS URL already hosted for this product (e.g. Cloudinary) when no new file chosen */
  imageUrl?: string | null;
}): Promise<ProductDraftResult> {
  const user = await getFirebaseCurrentUserWhenReady();
  if (!user) throw new Error("Sign in to use AI drafts.");

  const token = await user.getIdToken();
  let imageBase64 = "";
  let imageMimeType = "image/jpeg";
  if (opts.imageFile) {
    imageMimeType = opts.imageFile.type || "image/jpeg";
    imageBase64 = await readFileAsBase64(opts.imageFile);
  }

  let imageUrl = "";
  if (!imageBase64 && opts.imageUrl?.startsWith("https://")) {
    imageUrl = opts.imageUrl.trim();
  }

  const res = await fetch("/api/ai/product-draft", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      workingTitle: opts.workingTitle.trim(),
      imageBase64,
      imageMimeType,
      imageUrl,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string } & Partial<ProductDraftResult>;
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Draft request failed.");
  }

  if (
    typeof data.name !== "string" ||
    typeof data.description !== "string" ||
    typeof data.suggestedCategory !== "string" ||
    !Array.isArray(data.suggestedTags)
  ) {
    throw new Error("Invalid response from server.");
  }

  return {
    name: data.name,
    description: data.description,
    suggestedCategory: data.suggestedCategory,
    suggestedTags: data.suggestedTags.map((t) => String(t)),
  };
}
