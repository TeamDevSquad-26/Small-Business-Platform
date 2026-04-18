"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { ArrowLeft, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFirebaseCurrentUserWhenReady,
  getFirebaseDb,
} from "@/lib/firebase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { LAUNCH_OFFER, SUBSCRIPTION_PLANS } from "@/lib/subscriptions/plans";
import {
  PLAN_CAPS,
  getUserSubscription,
  resolvePlanByCode,
  type SubscriptionSnapshot,
} from "@/lib/subscriptions/access";

const CATEGORIES = [
  "Fashion",
  "Electronics",
  "Beauty",
  "Food & Grocery",
  "Home & Decor",
  "Services",
] as const;

function firestoreErrMessage(err: unknown, fallback: string): string {
  if (err instanceof FirebaseError) {
    if (err.code === "permission-denied") {
      return "Couldn’t save. Make sure you’re signed in with the right account.";
    }
    return `${err.message} (${err.code})`;
  }
  return err instanceof Error ? err.message : fallback;
}

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    isReady,
    isFirebaseConfigured,
    updateDisplayName,
  } = useAuth();

  const [profileName, setProfileName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [shopId, setShopId] = useState<string | null>(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopName, setShopName] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [jazzCashNumber, setJazzCashNumber] = useState("");
  const [easyPaisaNumber, setEasyPaisaNumber] = useState("");
  const [savingShop, setSavingShop] = useState(false);
  const [shopMessage, setShopMessage] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionSnapshot | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "standard" | "premium">(
    "basic"
  );
  const [savingPlan, setSavingPlan] = useState(false);
  const [planMessage, setPlanMessage] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponPct, setCouponPct] = useState("10");
  const [coupons, setCoupons] = useState<{ code: string; percentOff: number }[]>([]);
  const [couponMessage, setCouponMessage] = useState("");

  useEffect(() => {
    if (isReady && !user) router.replace("/login");
  }, [isReady, user, router]);

  useEffect(() => {
    if (user?.name) setProfileName(user.name);
  }, [user?.uid, user?.name]);

  const ownerKey = isReady && user?.uid ? user.uid : null;

  useEffect(() => {
    if (!ownerKey || !isFirebaseConfigured) {
      setShopLoading(false);
      setShopId(null);
      return;
    }
    const db = getFirebaseDb();
    if (!db) {
      setShopLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "shops"),
            where("ownerId", "==", ownerKey),
            limit(1)
          )
        );
        if (cancelled) return;
        const d = snap.docs[0];
        if (!d) {
          setShopId(null);
          setShopLoading(false);
          return;
        }
        const x = d.data();
        setShopId(d.id);
        setShopName(typeof x.shopName === "string" ? x.shopName : "");
        setCity(typeof x.city === "string" ? x.city : "");
        setDescription(typeof x.description === "string" ? x.description : "");
        setCategory(typeof x.category === "string" ? x.category : "");
        setInstagram(typeof x.instagram === "string" ? x.instagram : "");
        setFacebook(typeof x.facebook === "string" ? x.facebook : "");
        setWhatsapp(typeof x.whatsapp === "string" ? x.whatsapp : "");
        setJazzCashNumber(
          typeof x.jazzCashNumber === "string" ? x.jazzCashNumber : ""
        );
        setEasyPaisaNumber(
          typeof x.easyPaisaNumber === "string" ? x.easyPaisaNumber : ""
        );
      } finally {
        if (!cancelled) setShopLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ownerKey, isFirebaseConfigured]);

  useEffect(() => {
    if (!ownerKey || !isFirebaseConfigured) return;
    const db = getFirebaseDb();
    if (!db) return;
    let cancelled = false;
    (async () => {
      const sub = await getUserSubscription(db, ownerKey);
      if (!cancelled) {
        setSubscription(sub);
        setSelectedPlan(sub.selectedPlan);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ownerKey, isFirebaseConfigured]);

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
            code: typeof x?.code === "string" ? x.code : "",
            percentOff:
              typeof x?.percentOff === "number" ? x.percentOff : Number(x?.percentOff) || 0,
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
  }, [shopId, isFirebaseConfigured]);

  async function handleSaveProfile() {
    setProfileMessage("");
    if (!isFirebaseConfigured) {
      setProfileMessage("App isn’t ready right now. Try again later.");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await updateDisplayName(profileName);
      if (!res.ok) {
        setProfileMessage(res.message);
        return;
      }
      try {
        const current = await getFirebaseCurrentUserWhenReady();
        if (current?.uid) {
          const db = getFirebaseDb();
          if (db) {
            await setDoc(
              doc(db, "users", current.uid),
              {
                name: profileName.trim(),
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
          }
        }
      } catch {
        /* Optional profile doc sync; display name already updated in Auth. */
      }
      setProfileMessage("Profile saved.");
    } catch (e) {
      setProfileMessage(firestoreErrMessage(e, "Could not save profile."));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveShop() {
    setShopMessage("");
    if (!shopId) return;
    if (!isFirebaseConfigured) {
      setShopMessage("App isn’t ready right now. Try again later.");
      return;
    }
    const sn = shopName.trim();
    const ct = city.trim();
    const ds = description.trim();
    const cat = category.trim();
    const jazz = jazzCashNumber.trim();
    const easypaisa = easyPaisaNumber.trim();
    if (!sn || !ct || !ds || !cat) {
      setShopMessage("Shop name, city, description, and category are required.");
      return;
    }
    if (!jazz && !easypaisa) {
      setShopMessage("Add at least one payment number: JazzCash or EasyPaisa.");
      return;
    }

    setSavingShop(true);
    try {
      await getFirebaseCurrentUserWhenReady();
      const db = getFirebaseDb();
      if (!db) {
        setShopMessage("Couldn’t connect. Try again.");
        return;
      }
      await updateDoc(doc(db, "shops", shopId), {
        shopName: sn,
        city: ct,
        description: ds,
        category: cat,
        instagram: instagram.trim(),
        facebook: facebook.trim(),
        whatsapp: whatsapp.trim(),
        jazzCashNumber: jazzCashNumber.trim(),
        easyPaisaNumber: easyPaisaNumber.trim(),
        updatedAt: serverTimestamp(),
      });
      setShopMessage("Shop details saved.");
    } catch (e) {
      setShopMessage(firestoreErrMessage(e, "Could not save shop."));
    } finally {
      setSavingShop(false);
    }
  }

  async function handleSavePlan() {
    setPlanMessage("");
    if (!ownerKey || !isFirebaseConfigured) return;
    const db = getFirebaseDb();
    if (!db) return;
    setSavingPlan(true);
    try {
      await setDoc(
        doc(db, "users", ownerKey),
        { subscriptionPlan: selectedPlan, updatedAt: serverTimestamp() },
        { merge: true }
      );
      const sub = await getUserSubscription(db, ownerKey);
      setSubscription(sub);
      setPlanMessage("Plan preference saved.");
    } catch (e) {
      setPlanMessage(firestoreErrMessage(e, "Could not save plan."));
    } finally {
      setSavingPlan(false);
    }
  }

  async function handleAddCoupon() {
    setCouponMessage("");
    if (!shopId || !isFirebaseConfigured) return;
    const db = getFirebaseDb();
    if (!db) return;
    const code = couponCode.trim().toUpperCase();
    const pct = Number(couponPct);
    if (!code) {
      setCouponMessage("Coupon code required.");
      return;
    }
    if (!Number.isFinite(pct) || pct < 1 || pct > 80) {
      setCouponMessage("Discount should be between 1% and 80%.");
      return;
    }
    const next = [
      ...coupons.filter((c) => c.code !== code),
      { code, percentOff: Math.round(pct) },
    ].slice(-20);
    try {
      await updateDoc(doc(db, "shops", shopId), {
        coupons: next,
        updatedAt: serverTimestamp(),
      });
      setCoupons(next);
      setCouponCode("");
      setCouponPct("10");
      setCouponMessage("Coupon saved.");
    } catch (e) {
      setCouponMessage(firestoreErrMessage(e, "Could not save coupon."));
    }
  }

  if (!isReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted">
            Apna naam aur shop ki details yahan update karo.
          </p>
        </div>

        <Card hover={false} className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-ink">Account</h2>
          <p className="mt-1 text-sm text-muted">
            Display name buyers ke sath dikhai deta hai.
          </p>
          <div className="mt-6 space-y-4">
            <Input
              label="Display name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              autoComplete="name"
            />
            <Input
              label="Email"
              value={user?.email ?? ""}
              disabled
              className="bg-gray-50 text-muted"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                disabled={savingProfile}
                onClick={() => void handleSaveProfile()}
              >
                {savingProfile ? "Saving…" : "Save profile"}
              </Button>
              {profileMessage ? (
                <p
                  className={cn(
                    "text-sm",
                    profileMessage.includes("saved")
                      ? "text-muted"
                      : "text-red-600"
                  )}
                >
                  {profileMessage}
                </p>
              ) : null}
            </div>
          </div>
        </Card>

        <Card hover={false} className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-ink">Shop</h2>
          <p className="mt-1 text-sm text-muted">
            Public shop page par yahi details dikhengi (logo/cover Create shop se).
          </p>

          {shopLoading ? (
            <p className="mt-6 text-sm text-muted">Loading shop…</p>
          ) : !shopId ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center">
              <p className="text-sm text-muted">Abhi koi shop nahi bani.</p>
              <Link
                href="/dashboard/create-shop"
                className="mt-3 inline-block text-sm font-semibold text-secondary hover:underline"
              >
                Create shop
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <Input
                label="Shop name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <div className="space-y-1.5">
                <label
                  htmlFor="settings-description"
                  className="block text-sm font-medium text-ink"
                >
                  Description
                </label>
                <textarea
                  id="settings-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cn(
                    "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-ink shadow-sm",
                    "placeholder:text-muted transition-shadow duration-200",
                    "hover:border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="settings-category"
                  className="block text-sm font-medium text-ink"
                >
                  Category
                </label>
                <select
                  id="settings-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-ink shadow-sm transition-shadow hover:border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Social / contact
              </p>
              <Input
                label="Instagram (optional)"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@handle or URL"
              />
              <Input
                label="Facebook (optional)"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
              />
              <Input
                label="WhatsApp (optional)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Phone or link"
              />
              <Input
                label="JazzCash number (required for online payments)"
                value={jazzCashNumber}
                onChange={(e) => setJazzCashNumber(e.target.value)}
                placeholder="03xxxxxxxxx"
              />
              <Input
                label="EasyPaisa number (optional if JazzCash added)"
                value={easyPaisaNumber}
                onChange={(e) => setEasyPaisaNumber(e.target.value)}
                placeholder="03xxxxxxxxx"
              />
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  type="button"
                  disabled={savingShop}
                  onClick={() => void handleSaveShop()}
                >
                  {savingShop ? "Saving…" : "Save shop details"}
                </Button>
                {shopMessage ? (
                  <p
                    className={cn(
                      "text-sm",
                      shopMessage.includes("saved")
                        ? "text-muted"
                        : "text-red-600"
                    )}
                  >
                    {shopMessage}
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </Card>

        <Card hover={false} className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-ink">Subscription</h2>
          <p className="mt-1 text-sm text-muted">
            Launch phase mein sab users ko one month free access diya ja raha hai.
          </p>

          <div className="mt-4 rounded-xl border border-secondary/20 bg-secondary/5 p-4">
            <p className="text-sm font-semibold text-secondary">{LAUNCH_OFFER.title}</p>
            <p className="mt-1 text-sm text-muted">{LAUNCH_OFFER.detail}</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.code}
                className={cn(
                  "rounded-2xl border p-4",
                  plan.featured
                    ? "border-secondary/40 bg-secondary/[0.04]"
                    : "border-gray-200 bg-white"
                )}
              >
                <p className="text-sm font-semibold text-ink">{plan.name}</p>
                <p className="mt-1 text-2xl font-bold text-ink">
                  PKR {plan.pricePkr.toLocaleString()}
                  <span className="ml-1 text-xs font-medium text-muted">/mo</span>
                </p>
                <ul className="mt-3 space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs text-muted"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-ink">Plan after launch month</p>
            <p className="mt-1 text-xs text-muted">
              Launch free phase ke baad selected plan billing apply hogi.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <button
                  key={plan.code}
                  type="button"
                  onClick={() => setSelectedPlan(plan.code)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium",
                    selectedPlan === plan.code
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-gray-200 text-muted hover:border-gray-300"
                  )}
                >
                  {plan.name}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Button
                type="button"
                onClick={() => void handleSavePlan()}
                disabled={savingPlan}
              >
                {savingPlan ? "Saving…" : "Save plan preference"}
              </Button>
              {planMessage ? <p className="text-sm text-muted">{planMessage}</p> : null}
            </div>
            {subscription ? (
              <p className="mt-3 text-xs text-muted">
                Active now: <span className="font-semibold text-ink">{resolvePlanByCode(subscription.effectivePlan).name}</span>
                {" • "}After launch:{" "}
                <span className="font-semibold text-ink">
                  {resolvePlanByCode(subscription.selectedPlan).name}
                </span>
              </p>
            ) : null}
          </div>

          {subscription && PLAN_CAPS[subscription.effectivePlan].couponsEnabled ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold text-ink">Discount coupons</p>
              <p className="mt-1 text-xs text-muted">
                Standard/Premium feature. Add coupon code and percent off for checkout.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Input
                  label="Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="EID20"
                />
                <Input
                  label="Discount %"
                  value={couponPct}
                  onChange={(e) => setCouponPct(e.target.value)}
                  placeholder="10"
                />
                <div className="flex items-end">
                  <Button type="button" onClick={() => void handleAddCoupon()} className="w-full">
                    Add / Update coupon
                  </Button>
                </div>
              </div>
              {couponMessage ? (
                <p className="mt-2 text-xs text-muted">{couponMessage}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {coupons.length === 0 ? (
                  <p className="text-xs text-muted">No coupons yet.</p>
                ) : (
                  coupons.map((c) => (
                    <span
                      key={c.code}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-ink"
                    >
                      {c.code} - {c.percentOff}% OFF
                    </span>
                  ))
                )}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted">
              Discount coupons unlock on Standard and Premium plans.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
