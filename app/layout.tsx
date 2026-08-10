import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import Providers from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: {
    default: "Santechs — B2B Industrial Marketplace",
    template: "%s | Santechs",
  },
  description:
    "Buy and sell textile machinery, recycling plants, raw materials, and spare parts. India's premier B2B industrial marketplace connecting verified sellers with global buyers.",
  keywords: [
    "textile machinery",
    "recycling plant",
    "industrial marketplace",
    "B2B",
    "DTY machine",
    "FDY machine",
    "POY machine",
    "PET flakes",
    "spare parts",
    "India industrial",
  ],
  authors: [{ name: "Santechs" }],
  openGraph: {
    title: "Santechs — B2B Industrial Marketplace",
    description:
      "Buy and sell textile machinery, recycling plants, raw materials, and spare parts.",
    type: "website",
    locale: "en_IN",
    siteName: "Santechs",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
