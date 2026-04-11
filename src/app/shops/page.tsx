import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ShopsMarketplace } from "@/components/shops/ShopsMarketplace";

export const metadata: Metadata = {
  title: "Browse shops — Karobaar",
  description: "Discover small businesses on Karobaar.",
};

export default function ShopsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[60vh] bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Browse shops
            </h1>
            <p className="mt-2 text-muted">
              Explore businesses on the platform — each shop has its own profile,
              logo, and cover image.
            </p>
          </div>
          <ShopsMarketplace />
        </div>
      </main>
      <Footer />
    </>
  );
}
