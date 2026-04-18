"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFirebaseCurrentUserWhenReady,
  getFirebaseDb,
  isFirebaseConfigured,
} from "@/lib/firebase/client";
import { loadCartFromStorage, saveCartToStorage } from "@/lib/cart/storage";
import { Button } from "@/components/ui/Button";

type PublicProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
};

function toMillis(t: unknown): number {
  if (t && typeof t === "object" && t !== null && "toMillis" in t) {
    return (t as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function mergeCartWithStock(
  raw: Record<string, number>,
  products: PublicProduct[]
): Record<string, number> {
  const byId = new Map(products.map((p) => [p.id, p]));
  const next: Record<string, number> = {};
  for (const [id, q] of Object.entries(raw)) {
    const p = byId.get(id);
    if (!p || q <= 0) continue;
    if (p.stock === 0) continue;
    const cap = p.stock < 99999 ? Math.min(q, p.stock, 99) : Math.min(q, 99);
    if (cap > 0) next[id] = cap;
  }
  return next;
}

export function ShopProductsPublic({
  shopId,
  shopOwnerId,
  shopName,
  jazzCashNumber,
  easyPaisaNumber,
}: {
  shopId: string;
  shopOwnerId?: string;
  shopName?: string;
  jazzCashNumber?: string;
  easyPaisaNumber?: string;
}) {
  const router = useRouter();
  const { user, isReady } = useAuth();
  const [items, setItems] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [orderingId, setOrderingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartStorageReady, setCartStorageReady] = useState(false);
  const [coupons, setCoupons] = useState<{ code: string; percentOff: number }[]>(
    []
  );
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    percentOff: number;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"jazzcash" | "easypaisa">(
    "jazzcash"
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentReference, setPaymentReference] = useState("");

  const isOwnShop = Boolean(
    user?.uid && shopOwnerId && user.uid === shopOwnerId
  );

  useEffect(() => {
    setCart({});
    setCartStorageReady(false);
  }, [shopId]);

  useEffect(() => {
    if (!shopId || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const db = getFirebaseDb();
    if (!db) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        let snap;
        try {
          snap = await getDocs(
            query(
              collection(db, "products"),
              where("shopId", "==", shopId),
              orderBy("createdAt", "desc"),
              limit(48)
            )
          );
        } catch {
          snap = await getDocs(
            query(
              collection(db, "products"),
              where("shopId", "==", shopId),
              limit(100)
            )
          );
        }
        if (cancelled) return;

        const rows: (PublicProduct & { _t: number })[] = snap.docs.map((d) => {
          const x = d.data();
          const stockRaw = x.stock;
          const stock =
            stockRaw === undefined || stockRaw === null
              ? 99999
              : typeof stockRaw === "number"
                ? stockRaw
                : Number(stockRaw) || 0;
          return {
            id: d.id,
            name: typeof x.name === "string" ? x.name : "Product",
            price: typeof x.price === "number" ? x.price : Number(x.price) || 0,
            description:
              typeof x.description === "string" ? x.description.slice(0, 200) : "",
            imageUrl: typeof x.imageUrl === "string" ? x.imageUrl : "",
            category: typeof x.category === "string" ? x.category : "",
            stock,
            _t: toMillis(x.createdAt),
          };
        });
        rows.sort((a, b) => b._t - a._t);
        const list = rows.map(
          (r): PublicProduct => ({
            id: r.id,
            name: r.name,
            price: r.price,
            description: r.description,
            imageUrl: r.imageUrl,
            category: r.category,
            stock: r.stock,
          })
        );
        setItems(list);
        const initialQty: Record<string, number> = {};
        for (const p of list) initialQty[p.id] = 1;
        setQty(initialQty);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shopId]);

  /** Har shop ka alag cart — localStorage se load (products load hone ke baad). */
  useEffect(() => {
    if (loading) return;
    if (items.length === 0) {
      setCartStorageReady(true);
      return;
    }
    const ids = new Set(items.map((i) => i.id));
    const stored = loadCartFromStorage(shopId, ids);
    if (stored && Object.keys(stored).length > 0) {
      setCart(mergeCartWithStock(stored, items));
    }
    setCartStorageReady(true);
  }, [loading, items, shopId]);

  useEffect(() => {
    if (!cartStorageReady) return;
    saveCartToStorage(shopId, cart);
  }, [cart, shopId, cartStorageReady]);

  useEffect(() => {
    if (!shopId || !isFirebaseConfigured) {
      setCoupons([]);
      return;
    }
    const db = getFirebaseDb();
    if (!db) return;
    let cancelled = false;
    (async () => {
      const snap = await getDoc(doc(db, "shops", shopId));
      if (cancelled) return;
      const arr = snap.data()?.coupons;
      if (Array.isArray(arr)) {
        const rows = arr
          .map((x) => ({
            code:
              typeof x?.code === "string" ? x.code.toUpperCase().trim() : "",
            percentOff:
              typeof x?.percentOff === "number"
                ? x.percentOff
                : Number(x?.percentOff) || 0,
          }))
          .filter((x) => x.code && x.percentOff > 0);
        setCoupons(rows);
      } else {
        setCoupons([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  async function checkoutCart() {
    setBanner(null);
    if (!isReady) return;
    if (!user) {
      const ret = encodeURIComponent(`/shops/${shopId}`);
      router.push(`/login?returnUrl=${ret}`);
      return;
    }
    if (isOwnShop) {
      setBanner({ ok: false, text: "You can’t order from your own shop." });
      return;
    }

    const name = customerName.trim();
    const phone = customerPhone.trim().replace(/\s+/g, "");
    const address = deliveryAddress.trim();
    if (!name || !phone || !address) {
      setBanner({
        ok: false,
        text: "Please fill delivery name, mobile number, and full address.",
      });
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      setBanner({
        ok: false,
        text: "Enter a valid mobile number (e.g. 03XXXXXXXXX).",
      });
      return;
    }

    const availableJazz = (jazzCashNumber ?? "").trim();
    const availableEasy = (easyPaisaNumber ?? "").trim();
    const hasAnyAccount = Boolean(availableJazz || availableEasy);
    if (!hasAnyAccount) {
      setBanner({
        ok: false,
        text: "This shop has no JazzCash/EasyPaisa account configured yet.",
      });
      return;
    }
    if (paymentMethod === "jazzcash" && !availableJazz) {
      setBanner({ ok: false, text: "Seller has not configured JazzCash yet." });
      return;
    }
    if (paymentMethod === "easypaisa" && !availableEasy) {
      setBanner({ ok: false, text: "Seller has not configured EasyPaisa yet." });
      return;
    }

    const lines = items
      .filter((p) => (cart[p.id] ?? 0) > 0)
      .map((p) => ({
        productId: p.id,
        productName: p.name,
        unitPrice: p.price,
        quantity: cart[p.id]!,
        stock: p.stock,
      }));
    if (lines.length === 0) {
      setBanner({ ok: false, text: "Cart is empty. Tap Buy on a product first." });
      return;
    }
    const invalid = lines.find(
      (line) =>
        line.stock < 99999 && (line.stock <= 0 || line.quantity > line.stock)
    );
    if (invalid) {
      setBanner({
        ok: false,
        text: `Stock changed for ${invalid.productName}. Please update cart.`,
      });
      return;
    }

    const db = getFirebaseDb();
    if (!db) {
      setBanner({ ok: false, text: "Database unavailable." });
      return;
    }

    setOrderingId("cart");
    try {
      const current = await getFirebaseCurrentUserWhenReady();
      if (!current) {
        setBanner({ ok: false, text: "Please sign in again." });
        return;
      }

      const ref = doc(collection(db, "orders"));
      const subtotal = lines.reduce((sum, x) => sum + x.unitPrice * x.quantity, 0);
      const discountPct = appliedCoupon?.percentOff ?? 0;
      const discountAmount = Math.round((subtotal * discountPct) / 100);
      const totalPrice = Math.max(0, subtotal - discountAmount);
      const receiver =
        paymentMethod === "jazzcash" ? availableJazz : availableEasy;
      const refNote = paymentReference.trim();

      await setDoc(ref, {
        orderId: ref.id,
        userId: current.uid,
        shopId,
        items: lines.map((x) => ({
          productId: x.productId,
          productName: x.productName,
          unitPrice: x.unitPrice,
          quantity: x.quantity,
        })),
        totalPrice,
        subtotal,
        couponCode: appliedCoupon?.code ?? null,
        discountPercent: discountPct,
        discountAmount,
        paymentMethod,
        paymentReceiver: receiver,
        paymentStatus: "pending",
        paymentReference: refNote || null,
        customerName: name,
        customerPhone: phone,
        deliveryAddress: address,
        status: "pending",
        customerEmail: current.email ?? "",
        createdAt: serverTimestamp(),
      });

      setBanner({
        ok: true,
        text: `${shopName ? `${shopName}: ` : ""}Order placed. Advance payment: send Rs ${totalPrice.toLocaleString("en-PK")} via ${paymentMethod === "jazzcash" ? "JazzCash" : "EasyPaisa"} to ${receiver}. Order ID: ${ref.id.slice(0, 8)}…`,
      });
      setCart({});
      setAppliedCoupon(null);
      setCouponInput("");
      setPaymentReference("");
      saveCartToStorage(shopId, {});
    } catch (e) {
      setBanner({
        ok: false,
        text: e instanceof Error ? e.message : "Could not place order.",
      });
    } finally {
      setOrderingId(null);
    }
  }

  function addToCart(p: PublicProduct) {
    const q = Math.max(1, Math.min(99, qty[p.id] ?? 1));
    if (p.stock === 0) {
      setBanner({ ok: false, text: `${p.name} is out of stock.` });
      return;
    }
    if (p.stock < 99999 && q > p.stock) {
      setBanner({ ok: false, text: `Only ${p.stock} in stock for ${p.name}.` });
      return;
    }
    setCart((prev) => {
      const current = prev[p.id] ?? 0;
      const nextQty = current + q;
      const capped = p.stock < 99999 ? Math.min(nextQty, p.stock) : nextQty;
      return { ...prev, [p.id]: capped };
    });
    setBanner({ ok: true, text: `${p.name} — cart mein add ho gaya (is shop ka cart).` });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }

  function setCartQty(productId: string, nextQ: number, stock: number) {
    const q = Math.max(1, Math.floor(nextQ) || 1);
    const cap = stock < 99999 ? Math.min(q, stock, 99) : Math.min(q, 99);
    setCart((prev) => ({ ...prev, [productId]: cap }));
  }

  const cartRows = useMemo(
    () =>
      items
        .filter((p) => (cart[p.id] ?? 0) > 0)
        .map((p) => ({ ...p, quantity: cart[p.id]! })),
    [items, cart]
  );
  const subtotal = useMemo(
    () => cartRows.reduce((sum, r) => sum + r.price * r.quantity, 0),
    [cartRows]
  );
  const discountAmount = useMemo(() => {
    const pct = appliedCoupon?.percentOff ?? 0;
    return Math.round((subtotal * pct) / 100);
  }, [subtotal, appliedCoupon?.percentOff]);
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const canCheckout = cartRows.length > 0 && !isOwnShop;

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setAppliedCoupon(null);
      return;
    }
    const found = coupons.find((c) => c.code === code) ?? null;
    if (!found) {
      setBanner({ ok: false, text: "Invalid coupon code." });
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(found);
    setBanner({
      ok: true,
      text: `Coupon ${found.code} applied (${found.percentOff}% off).`,
    });
  }

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-muted">Loading products…</p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-muted">
        No products listed yet.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">Products</h2>
        {user && !isOwnShop ? (
          <Link
            href="/my-orders"
            className="text-sm font-medium text-secondary hover:underline"
          >
            My orders
          </Link>
        ) : null}
      </div>

      {coupons.length > 0 ? (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-xs font-medium text-muted">Have a discount coupon?</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Enter coupon code"
              className="w-44 rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <Button type="button" variant="ghost" onClick={applyCoupon}>
              Apply
            </Button>
            {appliedCoupon ? (
              <span className="text-xs font-medium text-secondary">
                Applied: {appliedCoupon.code} ({appliedCoupon.percentOff}% off)
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {banner ? (
        <p
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            banner.ok
              ? "border-secondary/30 bg-secondary/10 text-secondary"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {banner.text}
        </p>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((p) => {
          const busy = orderingId === "cart";
          const out = p.stock === 0;
          const unlimited = p.stock >= 99999;
          return (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-3 sm:flex-row"
            >
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-white sm:h-24 sm:w-24">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted">
                    —
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{p.name}</p>
                {p.category ? (
                  <p className="text-xs text-muted">{p.category}</p>
                ) : null}
                <p className="mt-1 text-sm font-bold text-secondary">
                  Rs {p.price.toLocaleString("en-PK")}
                </p>
                {out ? (
                  <p className="text-xs font-medium text-amber-800">Out of stock</p>
                ) : unlimited ? (
                  <p className="text-xs text-muted">In stock</p>
                ) : (
                  <p className="text-xs text-muted">In stock: {p.stock}</p>
                )}
                {p.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {p.description}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`qty-${p.id}`}>
                    Quantity
                  </label>
                  <input
                    id={`qty-${p.id}`}
                    type="number"
                    min={1}
                    max={p.stock > 0 && p.stock < 99999 ? p.stock : 99}
                    disabled={out || isOwnShop}
                    value={qty[p.id] ?? 1}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setQty((prev) => ({
                        ...prev,
                        [p.id]: Number.isFinite(v) ? v : 1,
                      }));
                    }}
                    className="w-20 rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-sm"
                  />
                  {isOwnShop ? (
                    <span className="text-xs text-muted">Your listing</span>
                  ) : (
                    <Button
                      type="button"
                      className="!px-4 !py-2 text-sm"
                      disabled={busy || out}
                      onClick={() => addToCart(p)}
                    >
                      {busy ? "…" : "Buy"}
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
        <h3 className="text-base font-semibold text-ink">
          Cart & checkout{" "}
          <span className="text-xs font-normal text-muted">
            (sirf is shop ka — alag shops ka alag cart)
          </span>
        </h3>
        {cartRows.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Cart khali hai. Upar product card se <strong>Buy</strong> dabao.
          </p>
        ) : (
          <>
            <ul className="mt-3 space-y-3 text-sm">
              {cartRows.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-50 pb-2 last:border-0"
                >
                  <div>
                    <span className="font-medium text-ink">{row.name}</span>
                    <span className="text-muted"> × </span>
                    <input
                      type="number"
                      min={1}
                      max={row.stock < 99999 ? row.stock : 99}
                      value={row.quantity}
                      onChange={(e) =>
                        setCartQty(row.id, parseInt(e.target.value, 10), row.stock)
                      }
                      className="ml-1 w-16 rounded-lg border border-gray-200 px-2 py-0.5 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-ink">
                      Rs {(row.price * row.quantity).toLocaleString("en-PK")}
                    </span>
                    <button
                      type="button"
                      className="text-xs font-medium text-red-600 hover:underline"
                      onClick={() => removeFromCart(row.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-gray-100 pt-3 text-sm">
              <p className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>Rs {subtotal.toLocaleString("en-PK")}</span>
              </p>
              {discountAmount > 0 ? (
                <p className="mt-1 flex justify-between text-secondary">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>- Rs {discountAmount.toLocaleString("en-PK")}</span>
                </p>
              ) : null}
              <p className="mt-2 flex justify-between text-base font-semibold text-ink">
                <span>Total (advance)</span>
                <span>Rs {finalTotal.toLocaleString("en-PK")}</span>
              </p>
            </div>

            <div className="mt-6 space-y-3 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="text-sm font-semibold text-ink">Delivery details</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium text-muted">
                  Full name *
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-ink"
                    placeholder="As on CNIC"
                  />
                </label>
                <label className="block text-xs font-medium text-muted">
                  Mobile (WhatsApp) *
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-ink"
                    placeholder="03XXXXXXXXX"
                  />
                </label>
              </div>
              <label className="block text-xs font-medium text-muted">
                Full delivery address *
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-ink"
                  placeholder="House / street, area, city"
                />
              </label>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Advance payment (JazzCash / EasyPaisa)
              </p>
              <p className="mt-1 text-xs text-muted">
                Order confirm ke baad neeche diye gaye number par <strong>full amount</strong>{" "}
                bhejo — yeh online wallet transfer hai.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("jazzcash")}
                  disabled={!jazzCashNumber}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    paymentMethod === "jazzcash"
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-gray-200 text-muted"
                  } ${!jazzCashNumber ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  JazzCash {jazzCashNumber ? `(${jazzCashNumber})` : "(not set)"}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("easypaisa")}
                  disabled={!easyPaisaNumber}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    paymentMethod === "easypaisa"
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-gray-200 text-muted"
                  } ${!easyPaisaNumber ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  EasyPaisa {easyPaisaNumber ? `(${easyPaisaNumber})` : "(not set)"}
                </button>
              </div>
            </div>

            <label className="mt-4 block text-xs font-medium text-muted">
              Payment reference (optional — payment ke baad transaction ID)
              <input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-ink"
                placeholder="Txn ID / TID"
              />
            </label>

            <Button
              type="button"
              className="mt-4 w-full sm:w-auto"
              disabled={!canCheckout || orderingId === "cart"}
              onClick={() => void checkoutCart()}
            >
              {orderingId === "cart" ? "Placing order…" : "Place order & pay in advance"}
            </Button>
          </>
        )}
      </div>

      {!user ? (
        <p className="mt-4 text-center text-sm text-muted">
          <Link
            href={`/login?returnUrl=${encodeURIComponent(`/shops/${shopId}`)}`}
            className="font-medium text-secondary hover:underline"
          >
            Sign in
          </Link>{" "}
          to use cart and checkout.
        </p>
      ) : null}
    </div>
  );
}
