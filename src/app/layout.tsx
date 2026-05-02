import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

/** Geometric sans — readable, slightly rounded; distinct from generic Inter/system stacks. */
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/** Display sans for titles — wide, confident letterforms that pair with orange brand UI. */
const syneHeading = Syne({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["500", "600", "700", "800"],
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
      className={`${outfit.variable} ${syneHeading.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
