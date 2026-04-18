/** Per-shop cart in `localStorage` — key isolates each vendor's storefront. */
export function cartStorageKey(shopId: string): string {
  return `karobaar_cart_${shopId}`;
}

export function loadCartFromStorage(
  shopId: string,
  productIds: Set<string>
): Record<string, number> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(cartStorageKey(shopId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (!productIds.has(k)) continue;
      const n = Math.max(0, Math.floor(Number(v)) || 0);
      if (n > 0) out[k] = n;
    }
    return out;
  } catch {
    return null;
  }
}

export function saveCartToStorage(shopId: string, cart: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(cartStorageKey(shopId), JSON.stringify(cart));
  } catch {
    /* quota / private mode */
  }
}
