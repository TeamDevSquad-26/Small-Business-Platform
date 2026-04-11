import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ShopDetailView } from "@/components/shops/ShopDetailView";

export const metadata: Metadata = {
  title: "Shop — Karobaar",
  description: "View shop on Karobaar.",
};

export default function ShopDetailPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh] bg-background">
        <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 lg:px-8">
          <ShopDetailView />
        </div>
      </main>
      <Footer />
    </>
  );
}
