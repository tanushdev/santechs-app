import type { Metadata } from "next";
import ProductsClientPage from "@/components/products/ProductsClientPage";

export const metadata: Metadata = {
  title: "Browse Products — Textile Machinery & Raw Materials",
  description:
    "Search and filter thousands of verified textile machinery, recycling plants, raw materials, and spare parts listings.",
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  return <ProductsClientPage searchParams={searchParams} />;
}
