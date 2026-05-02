"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { Box, Pencil, Plus, Sparkles, Trash2, PackageSearch } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImageToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary/client";
import {
  getFirebaseCurrentUserWhenReady,
  getFirebaseDb,
} from "@/lib/firebase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import Link from "next/link";
import {
  PLAN_CAPS,
  getUserSubscription,
  resolvePlanByCode,
  type SubscriptionSnapshot,
} from "@/lib/subscriptions/access";
import { PRODUCT_CATEGORIES } from "@/lib/products/categories";
import { fetchAiFeatureStatus, requestProductDraft } from "@/lib/ai/product-draft-client";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  stock: number;
};

type ProductForm = {
  name: string;
  price: string;
  description: string;
  category: string;
  stock: string;
  imageFile: File | null;
};

type FormErrors = Partial<Record<keyof ProductForm, string>>;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_PRODUCT_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const initialForm: ProductForm = {
  name: "",
  price: "",
  description: "",
  category: "",
  stock: "0",
  imageFile: null,
};

function toMillis(t: unknown): number {
  if (t && typeof t === "object" && t !== null && "toMillis" in t) {
    return (t as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export default function ProductsPage() {
  const router = useRouter();
  const { user, isReady, isFirebaseConfigured } = useAuth();
  const [shopId, setShopId] = useState<string | null>(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [preview, setPreview] = useState("");
  const [formError, setFormError] = useState("");
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [aiDraftError, setAiDraftError] = useState("");
  /** null = status not loaded yet */
  const [aiProductDraftReady, setAiProductDraftReady] = useState<boolean | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { productDraft } = await fetchAiFeatureStatus();
      if (!cancelled) setAiProductDraftReady(productDraft);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isReady && !user) router.replace("/login");
  }, [isReady, user, router]);

  const resolveShop = useCallback(async (uid: string) => {
    const db = getFirebaseDb();
    if (!db) return null;
    const q = query(
      collection(db, "shops"),
      where("ownerId", "==", uid),
      limit(1)
    );
    const snap = await getDocs(q);
    const d = snap.docs[0];
    return d?.id ?? null;
  }, []);

  const loadProducts = useCallback(
    async (sid: string) => {
      const db = getFirebaseDb();
      if (!db) return;
      try {
        let snap;
        try {
          snap = await getDocs(
            query(
              collection(db, "products"),
              where("shopId", "==", sid),
              orderBy("createdAt", "desc"),
              limit(100)
            )
          );
        } catch {
          snap = await getDocs(
            query(
              collection(db, "products"),
              where("shopId", "==", sid),
              limit(100)
            )
          );
        }
        type Row = Product & { _t: number };
        const rows: Row[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          const price =
            typeof d.price === "number" ? d.price : Number(d.price) || 0;
          const stock =
            typeof d.stock === "number" ? d.stock : Number(d.stock) || 0;
          return {
            id: docSnap.id,
            name: typeof d.name === "string" ? d.name : "",
            price,
            description: typeof d.description === "string" ? d.description : "",
            category: typeof d.category === "string" ? d.category : "",
            imageUrl: typeof d.imageUrl === "string" ? d.imageUrl : "",
            stock,
            _t: toMillis(d.createdAt),
          };
        });
        rows.sort((a, b) => b._t - a._t);
        setProducts(
          rows.map(
            (r): Product => ({
              id: r.id,
              name: r.name,
              price: r.price,
              description: r.description,
              category: r.category,
              imageUrl: r.imageUrl,
              stock: r.stock,
            })
          )
        );
      } catch {
        setProducts([]);
      }
    },
    []
  );

  useEffect(() => {
    if (!isReady || !user?.uid || !isFirebaseConfigured) {
      setLoadingShop(false);
      setLoadingProducts(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const sid = await resolveShop(user.uid);
      if (cancelled) return;
      setShopId(sid);
      setLoadingShop(false);
      if (sid) await loadProducts(sid);
      if (!cancelled) setLoadingProducts(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.uid, isFirebaseConfigured, resolveShop, loadProducts]);

  useEffect(() => {
    if (!isReady || !user?.uid || !isFirebaseConfigured) return;
    const db = getFirebaseDb();
    if (!db) return;
    let cancelled = false;
    (async () => {
      const sub = await getUserSubscription(db, user.uid);
      if (!cancelled) setSubscription(sub);
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.uid, isFirebaseConfigured]);

  useEffect(() => {
    if (!form.imageFile) return;
    const url = URL.createObjectURL(form.imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.imageFile]);

  const editingProduct = useMemo(
    () => products.find((p) => p.id === editingId) ?? null,
    [products, editingId]
  );

  /** Edit modal: existing Cloudinary HTTPS image counts as vision input when no new file. */
  const aiHttpsExistingImage = useMemo(() => {
    if (form.imageFile) return null;
    return preview.startsWith("https://") ? preview : null;
  }, [form.imageFile, preview]);
  const caps = PLAN_CAPS[subscription?.effectivePlan ?? "basic"];
  const maxProducts = caps.maxProducts;
  const reachedProductLimit = Number.isFinite(maxProducts)
    ? products.length >= maxProducts
    : false;

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
    setPreview("");
    setEditingId(null);
    setFormError("");
    setAiDraftError("");
    setAiDraftLoading(false);
  };

  const openAddModal = () => {
    resetForm();
    setOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      description: product.description,
      category: product.category,
      stock: String(product.stock),
      imageFile: null,
    });
    setPreview(product.imageUrl);
    setErrors({});
    setFormError("");
    setAiDraftError("");
    setAiDraftLoading(false);
    setOpen(true);
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "Product name is required.";
    if (!form.price.trim()) nextErrors.price = "Price is required.";
    if (form.price && !/^\d+(\.\d{1,2})?$/.test(form.price))
      nextErrors.price = "Invalid price format (e.g. 1200 or 1200.50).";
    if (!form.category) nextErrors.category = "Please select a category.";
    if (!form.description.trim())
      nextErrors.description = "Description is required.";
    if (form.stock.trim() && !/^\d+$/.test(form.stock.trim()))
      nextErrors.stock = "Stock must be a whole number.";
    if (!editingId && !form.imageFile) {
      nextErrors.imageFile = "Please upload an image.";
    }
    if (!editingId && form.imageFile && form.imageFile.size > MAX_IMAGE_BYTES) {
      nextErrors.imageFile = "Image must be 5 MB or smaller.";
    }
    if (editingId && form.imageFile && form.imageFile.size > MAX_IMAGE_BYTES) {
      nextErrors.imageFile = "Image must be 5 MB or smaller.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    if (!shopId) {
      setFormError("No shop found. Create a shop first.");
      return;
    }
    if (!editingId && reachedProductLimit) {
      setFormError(
        `Product limit reached for ${resolvePlanByCode(subscription?.effectivePlan ?? "basic").name}.`
      );
      return;
    }
    if (!isCloudinaryConfigured) {
      setFormError("Image upload isn’t available right now. Try again later.");
      return;
    }

    const db = getFirebaseDb();
    if (!db) {
      setFormError("Couldn’t connect. Try again.");
      return;
    }

    setSaving(true);
    try {
      await getFirebaseCurrentUserWhenReady();
      const priceNum = parseFloat(form.price.trim());
      const stockNum = parseInt(form.stock.trim() || "0", 10) || 0;

      let imageUrl = editingProduct?.imageUrl ?? "";
      if (form.imageFile) {
        imageUrl = await uploadImageToCloudinary(form.imageFile, {
          folder: `karobaar/shops/${shopId}/products`,
        });
      }
      if (!imageUrl) {
        setFormError("Image is required.");
        setSaving(false);
        return;
      }

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), {
          name: form.name.trim(),
          price: priceNum,
          description: form.description.trim(),
          category: form.category,
          imageUrl,
          stock: stockNum,
        });
      } else {
        const ref = doc(collection(db, "products"));
        await setDoc(ref, {
          productId: ref.id,
          shopId,
          name: form.name.trim(),
          price: priceNum,
          description: form.description.trim(),
          category: form.category,
          imageUrl,
          stock: stockNum,
          createdAt: serverTimestamp(),
        });
      }

      await loadProducts(shopId);
      setOpen(false);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const runAiDraft = async () => {
    setAiDraftError("");
    if (!form.name.trim() && !form.imageFile && !aiHttpsExistingImage) {
      setAiDraftError(
        "Pehle naam likho, nayi photo upload karo, ya edit mode mein saved HTTPS image honi chahiye — AI ko in mein se kuch na kuch chahiye."
      );
      return;
    }
    setAiDraftLoading(true);
    try {
      const draft = await requestProductDraft({
        workingTitle: form.name,
        imageFile: form.imageFile,
        imageUrl: aiHttpsExistingImage,
      });
      const tagsLine =
        draft.suggestedTags.length > 0
          ? `\n\nSuggested tags: ${draft.suggestedTags.join(", ")}`
          : "";
      setForm((old) => ({
        ...old,
        name: draft.name.trim() || old.name,
        description: `${draft.description.trim()}${tagsLine}`.trim(),
        category: draft.suggestedCategory,
      }));
      setErrors((old) => ({
        ...old,
        name: undefined,
        description: undefined,
        category: undefined,
      }));
    } catch (e) {
      setAiDraftError(e instanceof Error ? e.message : "AI draft failed.");
    } finally {
      setAiDraftLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!shopId || !confirm("Delete this product?")) return;
    const db = getFirebaseDb();
    if (!db) return;
    try {
      await deleteDoc(doc(db, "products", id));
      await loadProducts(shopId);
    } catch {
      /* ignore */
    }
  };

  const loading = loadingShop || loadingProducts;

  if (!isReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <motion.div
        className="mx-auto max-w-6xl"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div
          variants={fadeSlideUp}
          className="mb-6 flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Products
            </h1>
            <p className="mt-1 text-sm text-muted">
              Add products with photo, price, and stock — optional AI draft from photo + title hint.
            </p>
            <p className="mt-1 text-xs text-muted">
              Plan: {resolvePlanByCode(subscription?.effectivePlan ?? "basic").name}{" "}
              {Number.isFinite(maxProducts)
                ? `(${products.length}/${maxProducts} products used)`
                : "(unlimited products)"}
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={openAddModal}
            disabled={!shopId || saving || reachedProductLimit}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </motion.div>
        {reachedProductLimit ? (
          <Card hover={false} className="mb-4 border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              Product limit reached. Upgrade plan to add more products.
            </p>
          </Card>
        ) : null}

        {!loadingShop && !shopId ? (
          <Card hover={false} className="p-8 text-center">
            <p className="text-muted">Create a shop before adding products.</p>
            <Link
              href="/dashboard/create-shop"
              className="mt-3 inline-block text-sm font-semibold text-secondary hover:underline"
            >
              Create shop
            </Link>
          </Card>
        ) : loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`s-${i}`}
                className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-soft"
              >
                <div className="h-40 rounded-xl bg-gray-100" />
                <div className="mt-4 h-4 w-2/3 rounded bg-gray-100" />
                <div className="mt-2 h-4 w-1/3 rounded bg-gray-100" />
                <div className="mt-4 h-9 rounded-xl bg-gray-100" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card
            hover={false}
            className="flex flex-col items-center justify-center py-14 text-center"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <PackageSearch className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-ink">No products yet</h2>
            <p className="mt-2 max-w-md text-sm text-muted">
              Add your first product so customers can see what you sell.
            </p>
            <Button className="mt-5 gap-2" onClick={openAddModal}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Card>
        ) : (
          <motion.div
            variants={staggerContainer}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={fadeSlideUp}>
                <Card className="flex h-full flex-col p-4">
                  <div className="relative mb-4 h-40 overflow-hidden rounded-xl bg-gray-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={900}
                        height={480}
                        unoptimized
                        className="h-40 w-full object-cover transition duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-ink">
                        {product.name}
                      </h3>
                      <span className="rounded-lg bg-secondary/10 px-2 py-1 text-xs font-semibold text-secondary">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted line-clamp-2">{product.description}</p>
                    <p className="mt-3 text-lg font-bold text-ink">
                      Rs {product.price.toLocaleString("en-PK")}
                    </p>
                    <p className="text-xs text-muted">Stock: {product.stock}</p>
                    {caps.lowStockAlerts && product.stock <= 5 ? (
                      <p className="mt-1 text-xs font-semibold text-amber-700">
                        Low stock alert
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="ghost"
                      className="flex-1 gap-1.5"
                      onClick={() => openEditModal(product)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 gap-1.5 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
                      onClick={() => void onDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        title={editingProduct ? "Edit Product" : "Add Product"}
        className="max-w-2xl"
      >
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="flex min-h-0 w-full flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable]">
          {formError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {formError}
            </p>
          ) : null}

          <div
            className={`rounded-2xl border p-4 ring-1 ${
              aiProductDraftReady === false
                ? "border-amber-200/90 bg-amber-50/50 ring-amber-100"
                : "border-orange-200/90 bg-gradient-to-br from-orange-50/90 to-white ring-orange-100/80"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-semibold text-orange-900">AI listing draft</p>
                {aiProductDraftReady === null ? (
                  <p className="text-xs text-stone-500">AI configuration check ho rahi hai…</p>
                ) : aiProductDraftReady === false ? (
                  <p className="text-xs leading-relaxed text-amber-950">
                    AI drafts abhi band hain: server / hosting env mein{" "}
                    <code className="rounded bg-amber-100/90 px-1 py-0.5 text-[0.65rem]">
                      OPENAI_API_KEY
                    </code>{" "}
                    set karo, phir app dubara deploy / restart karo. Firebase Admin + Firestore bhi API routes
                    ke liye zaroori hain.
                  </p>
                ) : (
                  <p className="text-xs leading-relaxed text-stone-600">
                    Roman Urdu tip: Name field mein chota hint likho (optional). Nayi photo lagao, ya{" "}
                    <strong className="font-semibold text-stone-700">Edit</strong> mode mein pehle se jo Cloudinary
                    image hai us par bhi vision chal sakti hai. Sab draft editable hai save se pehle — price /
                    stock tum khud rakho.
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                className="shrink-0 gap-2 border border-orange-200/80 bg-white text-orange-800 shadow-sm hover:border-orange-300 hover:bg-orange-50"
                disabled={
                  aiDraftLoading ||
                  saving ||
                  aiProductDraftReady !== true ||
                  (!form.name.trim() && !form.imageFile && !aiHttpsExistingImage)
                }
                onClick={() => void runAiDraft()}
              >
                <Sparkles className="h-4 w-4 text-orange-600" aria-hidden />
                {aiDraftLoading ? "Generating…" : "Generate draft"}
              </Button>
            </div>
            {aiDraftError ? (
              <p className="mt-3 text-xs font-medium text-red-600" role="alert">
                {aiDraftError}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) =>
                setForm((old) => ({ ...old, name: e.target.value }))
              }
              error={errors.name}
              required
            />
            <Input
              label="Price (Rs)"
              value={form.price}
              onChange={(e) =>
                setForm((old) => ({ ...old, price: e.target.value }))
              }
              placeholder="e.g. 2499"
              error={errors.price}
              required
            />
          </div>

          <Input
            label="Stock"
            value={form.stock}
            onChange={(e) =>
              setForm((old) => ({ ...old, stock: e.target.value }))
            }
            placeholder="0"
            error={errors.stock}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink">Category</label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((old) => ({ ...old, category: e.target.value }))
              }
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-ink shadow-sm transition hover:border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="">Select category</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category ? (
              <p className="text-xs font-medium text-red-600">{errors.category}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((old) => ({ ...old, description: e.target.value }))
              }
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-ink shadow-sm transition hover:border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Product details..."
              required
            />
            {errors.description ? (
              <p className="text-xs font-medium text-red-600">
                {errors.description}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink">
              Image {editingProduct ? "(optional — leave to keep current)" : ""}
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-muted transition hover:border-secondary/35 hover:bg-secondary/5">
              <Box className="h-4 w-4 text-secondary" />
              Click to choose an image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file && file.type && !ALLOWED_PRODUCT_IMAGE_MIMES.has(file.type)) {
                    setErrors((old) => ({
                      ...old,
                      imageFile: "JPEG, PNG, WebP, ya GIF use karo.",
                    }));
                    return;
                  }
                  setForm((old) => ({ ...old, imageFile: file }));
                  if (file) setErrors((old) => ({ ...old, imageFile: undefined }));
                }}
              />
            </label>
            {errors.imageFile ? (
              <p className="text-xs font-medium text-red-600">{errors.imageFile}</p>
            ) : null}
            {preview ? (
              <div className="overflow-hidden rounded-2xl border border-gray-100 p-2">
                <Image
                  src={preview}
                  alt="Product preview"
                  width={900}
                  height={480}
                  unoptimized
                  className="h-40 w-full rounded-xl object-cover"
                />
              </div>
            ) : null}
          </div>
          </div>

          <div className="mt-4 flex shrink-0 flex-wrap justify-end gap-2 border-t border-gray-100 bg-surface pt-4">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingProduct ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
