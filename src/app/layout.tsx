import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/** Elegant serif for headings — flowing, “joined” letterforms vs plain UI sans. */
const cormorantHeading = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["500", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://karobaar.pk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Karobaar — Shops for vendors, easy buying for everyone",
  description:
    "Create your storefront, share one link, and sell online. Shoppers browse local shops and checkout in one place.",
  openGraph: {
    title: "Karobaar — Shops for vendors, easy buying for everyone",
    description:
      "Create your storefront, share one link, and sell online. Shoppers browse local shops and checkout in one place.",
    siteName: "Karobaar",
    locale: "en_PK",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Karobaar — Shops for vendors, easy buying for everyone",
    description:
      "Create your storefront, share one link, and sell online. Shoppers browse local shops and checkout in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorantHeading.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
