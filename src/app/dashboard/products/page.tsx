"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Box, Pencil, Plus, Trash2, PackageSearch } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

type Product = {
  id: string;
  name: string;
  price: string;
  description: string;
  category: string;
  image: string;
};

type ProductForm = {
  name: string;
  price: string;
  description: string;
  category: string;
  imageFile: File | null;
};

type FormErrors = Partial<Record<keyof ProductForm, string>>;

const CATEGORIES = [
  "Fashion",
  "Electronics",
  "Beauty",
  "Home & Decor",
  "Food & Grocery",
  "Services",
];

const DEMO_PRODUCTS: Product[] = [
  {
    id: "p-1",
    name: "Premium Hoodie",
    price: "3499",
    description: "Soft fleece hoodie with embroidered logo.",
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "p-2",
    name: "Wireless Earbuds",
    price: "5999",
    description: "Noise cancellation and long battery backup.",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "p-3",
    name: "Organic Face Serum",
    price: "1890",
    description: "Vitamin-C based brightening skin serum.",
    category: "Beauty",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
  },
];

const initialForm: ProductForm = {
  name: "",
  price: "",
  description: "",
  category: "",
  imageFile: null,
};

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setProducts(DEMO_PRODUCTS);
      setLoading(false);
    }, 650);
    return () => clearTimeout(t);
  }, []);

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

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
    setPreview("");
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      imageFile: null,
    });
    setPreview(product.image);
    setErrors({});
    setOpen(true);
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "Product name required hai.";
    if (!form.price.trim()) nextErrors.price = "Price required hai.";
    if (form.price && !/^\d+(\.\d{1,2})?$/.test(form.price))
      nextErrors.price = "Price format sahi nahi (e.g. 1200 ya 1200.50).";
    if (!form.category) nextErrors.category = "Category select karein.";
    if (!form.description.trim())
      nextErrors.description = "Description required hai.";
    if (!preview) nextErrors.imageFile = "Image upload required hai.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: form.name.trim(),
                price: form.price.trim(),
                description: form.description.trim(),
                category: form.category,
                image: preview,
              }
            : p
        )
      );
    } else {
      const id = `p-${Date.now()}`;
      setProducts((prev) => [
        {
          id,
          name: form.name.trim(),
          price: form.price.trim(),
          description: form.description.trim(),
          category: form.category,
          image: preview,
        },
        ...prev,
      ]);
    }

    setOpen(false);
    resetForm();
  };

  const onDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

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
              Apni catalog manage karein, edits karein, aur items delete karein.
            </p>
          </div>
          <Button className="gap-2" onClick={openAddModal}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </motion.div>

        {loading ? (
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
              Apna pehla product add karein taake aap ki shop customers ko show
              ho.
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
                  <div className="relative mb-4 overflow-hidden rounded-xl">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={900}
                      height={480}
                      unoptimized
                      className="h-40 w-full object-cover transition duration-300 hover:scale-105"
                    />
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
                    <p className="text-sm text-muted">{product.description}</p>
                    <p className="mt-3 text-lg font-bold text-ink">
                      Rs {product.price}
                    </p>
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
                      onClick={() => onDelete(product.id)}
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
        <form onSubmit={onSubmit} className="space-y-4">
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
              label="Price"
              value={form.price}
              onChange={(e) =>
                setForm((old) => ({ ...old, price: e.target.value }))
              }
              placeholder="e.g. 2499"
              error={errors.price}
              required
            />
          </div>

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
              {CATEGORIES.map((c) => (
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
              Image Upload
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-muted transition hover:border-secondary/35 hover:bg-secondary/5">
              <Box className="h-4 w-4 text-secondary" />
              Click karke image select karein
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
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

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingProduct ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
