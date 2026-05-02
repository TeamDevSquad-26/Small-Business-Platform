/** Server-only helpers for AI product listing drafts (trust boundaries + image fetch). */

export const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function sanitizeImageMimeType(raw: string): string {
  const base = raw.split(";")[0]?.trim().toLowerCase() ?? "image/jpeg";
  return ALLOWED_IMAGE_MIMES.has(base) ? base : "image/jpeg";
}

/**
 * Returns true if URL is https and points to this shop's asset path (Cloudinary or Firebase Storage).
 */
export function isTrustedProductImageUrl(urlStr: string, shopId: string): URL | null {
  let u: URL;
  try {
    u = new URL(urlStr.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.toLowerCase();

  if (host === "res.cloudinary.com") {
    const needle = `/karobaar/shops/${shopId}/`;
    return u.pathname.includes(needle) ? u : null;
  }

  if (host === "firebasestorage.googleapis.com") {
    const m = u.pathname.match(/\/o\/(.+)/);
    if (!m?.[1]) return null;
    try {
      const decoded = decodeURIComponent(m[1].replace(/\+/g, " "));
      const needle = `shops/${shopId}/`;
      return decoded.includes(needle) ? u : null;
    } catch {
      return null;
    }
  }

  return null;
}

const MAX_FETCH_BYTES = 5 * 1024 * 1024;

export async function fetchTrustedProductImageAsBase64(
  url: URL
): Promise<{ base64: string; mime: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18_000);
  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: { Accept: "image/*" },
    });
    if (!res.ok) return null;

    const lenHeader = res.headers.get("content-length");
    if (lenHeader) {
      const n = parseInt(lenHeader, 10);
      if (Number.isFinite(n) && n > MAX_FETCH_BYTES) return null;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_FETCH_BYTES) return null;

    const mimeRaw =
      res.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "image/jpeg";
    const mime = ALLOWED_IMAGE_MIMES.has(mimeRaw) ? mimeRaw : null;
    if (!mime) return null;

    return { base64: buf.toString("base64"), mime };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
