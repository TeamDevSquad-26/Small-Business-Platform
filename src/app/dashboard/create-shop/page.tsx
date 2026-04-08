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

export default function CreateShopPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <Card hover={false} className="space-y-8 p-5 sm:p-7">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Create Shop
            </h1>
            <p className="mt-2 text-sm text-muted">
              Static aur easy form — basic details fill karein aur save karein.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {["Step 1", "Step 2", "Finish"].map((s, i) => (
              <div
                key={s}
                className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                  i === 0
                    ? "border-secondary/40 bg-secondary/10 text-secondary"
                    : "border-gray-200 bg-white text-muted"
                }`}
              >
                {s}
              </div>
            ))}
          </div>

          <form className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-ink">Basic Info</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Shop Name" required>
                  <input
                    required
                    placeholder="e.g. Karobaar Mart"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </Field>
                <Field label="City" required>
                  <input
                    required
                    placeholder="e.g. Lahore"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </Field>
              </div>
              <Field label="Description" required>
                <textarea
                  rows={4}
                  required
                  placeholder="Aap ki shop kis cheez mein special hai?"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </Field>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-ink">Media</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <UploadStatic label="Logo upload" inputId="logo" required />
                <UploadStatic
                  label="Cover image upload"
                  inputId="cover"
                  required
                />
              </div>
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-sm text-muted">
                Preview upload ke baad dashboard integration mein dikh jayega.
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-ink">Business Details</h2>
              <Field label="Category" required>
                <select
                  required
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
                    placeholder="https://instagram.com/yourshop"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </Field>
                <Field label="Facebook">
                  <input
                    type="url"
                    placeholder="https://facebook.com/yourshop"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </Field>
                <Field label="WhatsApp">
                  <input
                    type="tel"
                    placeholder="+923001234567"
                    pattern="^\+?[0-9]{10,15}$"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  />
                </Field>
              </div>
            </section>

            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-6">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
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

function UploadStatic({
  label,
  inputId,
  required,
}: {
  label: string;
  inputId: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={inputId}
      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 p-6 text-center transition hover:border-secondary/40 hover:bg-secondary/5"
    >
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className="text-xs text-muted">Click to upload image</span>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        required={required}
        className="sr-only"
      />
    </label>
  );
}
