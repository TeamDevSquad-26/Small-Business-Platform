"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  collection,
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import {
  isCloudinaryConfigured,
  uploadImageToCloudinary,
} from "@/lib/cloudinary/client";
import {
  auth,
  getFirebaseCurrentUserWhenReady,
  getFirebaseDb,
} from "@/lib/firebase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const CATEGORIES = [
  "Fashion",
  "Electronics",
  "Beauty",
  "Food & Grocery",
  "Home & Decor",
  "Services",
];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function postCreateShopJson(
  path: string,
  idToken: string,
  body: Record<string, unknown>
): Promise<Response> {
  return fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  });
}

function isFirestorePermissionDenied(err: unknown): boolean {
  return err instanceof FirebaseError && err.code === "permission-denied";
}

function formatSaveError(err: unknown): string {
  if (err instanceof FirebaseError) {
    if (err.code === "permission-denied") {
      return "Couldn’t save. Make sure you’re signed in with the account that owns this shop.";
    }
    if (err.code.startsWith("storage/")) {
      return `${err.message} (${err.code})`;
    }
    return `${err.message} (${err.code})`;
  }
  return err instanceof Error ? err.message : "Save failed.";
}

export default function CreateShopPage() {
  const router = useRouter();
  const { user, isReady, isFirebaseConfigured } = useAuth();
  const [step, setStep] = useState(1);
  const [shopName, setShopName] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isReady && !user) router.replace("/login");
  }, [isReady, user, router]);

  /** Load Step 1 draft if user already saved and came back. */
  useEffect(() => {
    if (!isReady) return;

    if (!user?.uid || !isFirebaseConfigured) {
      setDraftLoaded(true);
      return;
    }

    if (!auth) {
      setDraftLoaded(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await auth.authStateReady();
        if (cancelled) return;
        const db = getFirebaseDb();
        if (!db) return;
        const snap = await getDoc(doc(db, "users", user.uid));
        const d = snap.data()?.shopDraft as
          | {
              shopName?: string;
              city?: string;
              description?: string;
            }
          | undefined;
        if (!cancelled && d) {
          if (typeof d.shopName === "string") setShopName(d.shopName);
          if (typeof d.city === "string") setCity(d.city);
          if (typeof d.description === "string") setDescription(d.description);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setDraftLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.uid, isFirebaseConfigured]);

  async function saveStep1AndContinue() {
    setError("");
    setSuccess("");

    if (!isFirebaseConfigured) {
      setError("App isn’t ready to save right now. Try again later.");
      return;
    }

    const db = getFirebaseDb();
    if (!db) {
      setError("Couldn’t connect. Refresh the page and try again.");
      return;
    }

    const sn = shopName.trim();
    const ct = city.trim();
    const ds = description.trim();

    if (!sn || !ct || !ds) {
      setError("Please fill in Shop name, City, and Description.");
      return;
    }

    setSaving(true);
    try {
      const current = await getFirebaseCurrentUserWhenReady();
      if (!current) {
        setError("Login session not ready. Refresh the page and try again.");
        return;
      }

      const userRef = doc(db, "users", current.uid);
      const existing = await getDoc(userRef);
      const draftPayload = {
        userId: current.uid,
        email: current.email ?? "",
        name: current.displayName ?? user?.name ?? "",
        shopDraft: {
          shopName: sn,
          city: ct,
          description: ds,
          savedStep: 1,
          updatedAt: serverTimestamp(),
        },
        ...(!existing.exists() ? { role: "customer" as const } : {}),
      };

      try {
        await setDoc(userRef, draftPayload, { merge: true });
        setSuccess("Step 1 saved. Continue with images below.");
        setStep(2);
        return;
      } catch (first) {
        if (!isFirestorePermissionDenied(first)) {
          throw first;
        }
      }

      await current.getIdToken(true);
      const idToken = await current.getIdToken();

      const res = await postCreateShopJson("/api/create-shop/save-draft", idToken, {
        shopName: sn,
        city: ct,
        description: ds,
        name: current.displayName ?? user?.name ?? "",
      });

      if (res.ok) {
        setSuccess("Step 1 saved. Continue with images below.");
        setStep(2);
        return;
      }

      const apiBody = (await res.json().catch(() => ({}))) as {
        reason?: string;
        error?: string;
      };

      throw new Error(
        apiBody.error ||
          (apiBody.reason === "server_admin_not_configured"
            ? "Couldn’t save your draft. Try again in a moment."
            : `Save failed (${res.status}).`)
      );
    } catch (err) {
      setError(formatSaveError(err));
    } finally {
      setSaving(false);
    }
  }

  async function goToStep3() {
    setError("");
    setSuccess("");
    if (!logoFile || !coverFile) {
      setError("Please upload both a logo and a cover image.");
      return;
    }
    if (logoFile.size > MAX_IMAGE_BYTES || coverFile.size > MAX_IMAGE_BYTES) {
      setError("Each image must be 5 MB or smaller.");
      return;
    }
    setSuccess("");
    setStep(3);
  }

  async function handleFinalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isFirebaseConfigured) {
      setError("App isn’t ready to save right now. Try again later.");
      return;
    }

    const db = getFirebaseDb();
    if (!db) {
      setError("Couldn’t connect. Refresh the page and try again.");
      return;
    }

    if (!isCloudinaryConfigured()) {
      setError("Images can’t be uploaded right now. Try again later.");
      return;
    }

    const sn = shopName.trim();
    const ct = city.trim();
    const ds = description.trim();
    const cat = category.trim();
    const ig = instagram.trim();
    const fb = facebook.trim();
    const wa = whatsapp.trim();

    if (!sn || !ct || !ds || !cat) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!logoFile || !coverFile) {
      setError("Please upload both a logo and a cover image.");
      return;
    }

    if (logoFile.size > MAX_IMAGE_BYTES || coverFile.size > MAX_IMAGE_BYTES) {
      setError("Each image must be 5 MB or smaller.");
      return;
    }

    setSaving(true);
    try {
      const current = await getFirebaseCurrentUserWhenReady();
      if (!current) {
        setError("Login session not ready. Refresh the page and try again.");
        return;
      }

      const uid = current.uid;
      const folder = `karobaar/shops/${uid}`;

      const logoUrl = await uploadImageToCloudinary(logoFile, {
        folder: `${folder}/logo`,
      });
      const coverUrl = await uploadImageToCloudinary(coverFile, {
        folder: `${folder}/cover`,
      });

      const shopRef = doc(collection(db, "shops"));
      const shopDoc = {
        shopId: shopRef.id,
        ownerId: uid,
        shopName: sn,
        description: ds,
        city: ct,
        category: cat,
        instagram: ig,
        facebook: fb,
        whatsapp: wa,
        logoUrl,
        coverUrl,
        createdAt: serverTimestamp(),
      };

      const userUpdate = {
        userId: uid,
        email: current.email ?? "",
        name: current.displayName ?? user?.name ?? "",
        role: "shop_owner",
        updatedAt: serverTimestamp(),
        shopDraft: deleteField(),
      };

      try {
        await setDoc(shopRef, shopDoc);
        await setDoc(doc(db, "users", uid), userUpdate, { merge: true });
      } catch (first) {
        if (!isFirestorePermissionDenied(first)) {
          throw first;
        }

        await current.getIdToken(true);
        const idToken = await current.getIdToken();

        const apiRes = await postCreateShopJson("/api/create-shop/finalize", idToken, {
          shopName: sn,
          city: ct,
          description: ds,
          category: cat,
          instagram: ig,
          facebook: fb,
          whatsapp: wa,
          logoUrl,
          coverUrl,
          name: current.displayName ?? user?.name ?? "",
        });

        if (!apiRes.ok) {
          const apiBody = (await apiRes.json().catch(() => ({}))) as {
            reason?: string;
            error?: string;
          };
          throw new Error(
            apiBody.error ||
              (apiBody.reason === "server_admin_not_configured"
                ? "Couldn’t save your shop. Try again in a moment."
                : `Save failed (${apiRes.status}).`)
          );
        }
      }

      setSuccess("Shop saved successfully.");
      setShopName("");
      setCity("");
      setDescription("");
      setCategory("");
      setInstagram("");
      setFacebook("");
      setWhatsapp("");
      setLogoFile(null);
      setCoverFile(null);
      setStep(1);
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err) {
      setError(formatSaveError(err));
    } finally {
      setSaving(false);
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
      <div className="mx-auto max-w-5xl">
        <Card hover={false} className="space-y-8 p-5 sm:p-7">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Create Shop
            </h1>
            <p className="mt-2 text-sm text-muted">
              Step 1: basic details. Step 2: logo and cover. Step 3: category and links — then
              finish to create your shop.
            </p>
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">
              {success}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            {["Step 1 — Basic info", "Step 2 — Media", "Finish"].map((s, i) => (
              <div
                key={s}
                className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                  step === i + 1
                    ? "border-secondary/40 bg-secondary/10 text-secondary"
                    : "border-gray-200 bg-white text-muted"
                }`}
              >
                {s}
              </div>
            ))}
          </div>

          {!draftLoaded ? (
            <p className="text-sm text-muted">Loading your saved draft…</p>
          ) : (
            <>
              {step === 1 ? (
                <div className="space-y-8">
                  <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-ink">Basic Info</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Shop Name" required>
                        <input
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          placeholder="e.g. Karobaar Mart"
                          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        />
                      </Field>
                      <Field label="City" required>
                        <input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Lahore"
                          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        />
                      </Field>
                    </div>
                    <Field label="Description" required>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What makes your shop special?"
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      />
                    </Field>
                  </section>
                  <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.back()}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={saving}
                      onClick={() => void saveStep1AndContinue()}
                    >
                      {saving ? "Saving…" : "Save & continue to Step 2"}
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-8">
                  <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-ink">Media</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      <ImageDropzone
                        inputId="shop-logo"
                        label="Logo"
                        file={logoFile}
                        onFileChange={setLogoFile}
                        required
                      />
                      <ImageDropzone
                        inputId="shop-cover"
                        label="Cover image"
                        file={coverFile}
                        onFileChange={setCoverFile}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted">
                      Images are sent when you finish (max 5 MB each).
                    </p>
                  </section>
                  <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setError("");
                        setSuccess("");
                        setStep(1);
                      }}
                      disabled={saving}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      disabled={saving}
                      onClick={() => void goToStep3()}
                    >
                      Continue to Finish
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <form className="space-y-8" onSubmit={handleFinalSubmit}>
                  <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-ink">Business Details</h2>
                    <Field label="Category" required>
                      <select
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-ink">Social Links</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Field label="Instagram">
                        <input
                          type="url"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          placeholder="https://instagram.com/yourshop"
                          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        />
                      </Field>
                      <Field label="Facebook">
                        <input
                          type="url"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          placeholder="https://facebook.com/yourshop"
                          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-secondary focus:ring-secondary/20"
                        />
                      </Field>
                      <Field label="WhatsApp">
                        <input
                          type="tel"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="+923001234567"
                          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        />
                      </Field>
                    </div>
                  </section>

                  <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setError("");
                        setSuccess("");
                        setStep(2);
                      }}
                      disabled={saving}
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving…" : "Save shop"}
                    </Button>
                  </div>
                </form>
              ) : null}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function ImageDropzone({
  inputId,
  label,
  file,
  onFileChange,
  required,
}: {
  inputId: string;
  label: string;
  file: File | null;
  onFileChange: (f: File | null) => void;
  required?: boolean;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 transition hover:border-secondary/40 hover:bg-secondary/5">
      <input
        id={inputId}
        type="file"
        accept="image/*"
        required={required && !file}
        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
        aria-label={label}
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          onFileChange(f);
        }}
      />
      <div className="pointer-events-none relative z-10 flex min-h-[160px] flex-col items-center justify-center gap-2 p-4 text-center">
        {previewUrl ? (
          <div className="relative h-32 w-full max-w-[220px]">
            <Image
              src={previewUrl}
              alt={`${label} preview`}
              fill
              unoptimized
              className="object-contain"
            />
          </div>
        ) : null}
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-xs text-muted">
          {file ? file.name : "Click or tap anywhere in this box to choose an image"}
        </span>
      </div>
    </div>
  );
}
