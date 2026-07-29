import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "National Mineral Intelligence Dashboard — Republic of Guinea",
  description: "Integrated national visibility across Guinea's mining sector, exploration evidence, revenue, infrastructure, and compliance.",
  openGraph: {
    title: "National Mineral Intelligence Dashboard",
    description: "Integrated national visibility across Guinea's mining sector.",
    type: "website",
    images: [{ url: "/og-v2.png", width: 1200, height: 630, alt: "National Mineral Intelligence Dashboard — Republic of Guinea" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "National Mineral Intelligence Dashboard",
    description: "Integrated national visibility across Guinea's mining sector.",
    images: ["/og-v2.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
