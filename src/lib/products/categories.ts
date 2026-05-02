/** Single source of truth for product categories (Firestore + AI prompts + dashboard UI). */
export const PRODUCT_CATEGORIES = [
  "Fashion",
  "Electronics",
  "Beauty",
  "Home & Decor",
  "Food & Grocery",
  "Services",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
