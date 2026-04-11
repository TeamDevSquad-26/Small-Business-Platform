"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFirebaseCurrentUserWhenReady,
  getFirebaseDb,
} from "@/lib/firebase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

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
  const [savingShop, setSavingShop] = useState(false);
  const [shopMessage, setShopMessage] = useState("");

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
      } finally {
        if (!cancelled) setShopLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ownerKey, isFirebaseConfigured]);

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
    if (!sn || !ct || !ds || !cat) {
      setShopMessage("Shop name, city, description, and category are required.");
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
        updatedAt: serverTimestamp(),
      });
      setShopMessage("Shop details saved.");
    } catch (e) {
      setShopMessage(firestoreErrMessage(e, "Could not save shop."));
    } finally {
      setSavingShop(false);
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
      </div>
    </div>
  );
}
